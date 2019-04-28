import { IMonster } from "./ICard";
import { getRandomCard } from "./cards";
import IMonsterToken from "./token";

export const START_CARDS_COUNT = 4;

function getRandomStartHand() {
	return new Array(START_CARDS_COUNT).fill(0).map(() => getRandomCard());
}

function getMovesCount(cardsCountInHand: number) {
	return Math.ceil(cardsCountInHand * 0.3);
}

type Events = Array<{ name: string, [key: string]: any }>;
type CallResult = { events: Events, variants: Array<{ method: string, [key: string]: any }> }

enum STATE {
	CALL_OF_MONSTERS,
	END_OF_THE_GAME,
}

type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & { length: TLength };

export default class Game {
	private _hands = <Tuple<Array<IMonster>, 2>>new Array(2).fill(0).map(() => getRandomStartHand());
	public get hands() { return <Tuple<Array<string>, 2>>this._hands.map((hand) => hand.map(({ id }) => id)); };

	private _table = <Tuple<Array<IMonsterToken>, 2>>new Array(2).fill(0).map((): Array<IMonsterToken> => []);
	private _hp = <Tuple<number, 2>>new Array(2).fill(50);

	private _playerMove = Math.floor(Math.random() * 2);
	public get playerMove() { return this._playerMove; }

	private _state: STATE = STATE.CALL_OF_MONSTERS;
	public get state() { return this._state; }

	// TODO: check cards count on end of step to make damage on overflow
	private _movesLeft = getMovesCount(START_CARDS_COUNT);
	public get movesLeft() { return this._movesLeft; }

	constructor() {
		// TODO: check game status
	}

	getAvailableMoves() {
		if (this.movesLeft === 0) return [];
		switch (this.state) {
			case STATE.CALL_OF_MONSTERS:
				let result = [];
				for (let cardIndex = 0; cardIndex < this._hands[this.playerMove].length; cardIndex++) {
					const card = this._hands[this.playerMove][cardIndex];
					if ((card as IMonster).cost < this._hp[this.playerMove]) {
						result.push({ method: 'call', index: cardIndex });
					}
				}
				result.push({ method: 'end_move', byPlayer: this.playerMove });
				return result;
			default:
				throw new Error();
		}
	}

	callMonster(player: number, card: number): CallResult {
		this._onlyByCurrentPlayer(player);
		this._onlyOnMonstersCalling();
		if (!Number.isInteger(card)) throw new Error('card index must be a integer');
		if (card < 0) throw new Error('card index must not be a negative');
		if (this._hands[player].length <= card) throw new Error('no this card');
		if ((this._hands[player][card] as IMonster).cost >= this._hp[player]) throw new Error('not enough hps');
		const cardToCall = this._hands[player][card]
		this._table[player].push({ ...cardToCall, humility: 0 });
		for (let i = card; i < this._hands[player].length - 1; i++) this._hands[player][i] = this._hands[player][i + 1];
		this._hands[player].pop();
		this._hp[player] -= cardToCall.cost;
		const events: Events = [{ name: 'call', player, card: cardToCall.id }];
		if (this._hp[player] <= 0) {
			events.push({ name: 'victory', ofPlayer: player });
			this._state = STATE.END_OF_THE_GAME;
			return { events, variants: [] };
		}
		this._movesLeft--;
		const availableMoves = this.getAvailableMoves();
		if (availableMoves.length > 0) {
			return { events, variants: [...availableMoves, { method: 'end_move', byPlayer: this.playerMove }] };
		}
		const { events: newEvents, variants } = this.endMove(player);
		return { events: [...events, ...newEvents], variants };
	}

	endMove(player: number): CallResult {
		this._onlyByCurrentPlayer(player);
		this._onlyOnMonstersCalling();
		this._playerMove = (this._playerMove + 1) % 2;
		this._hands[this.playerMove].push(...new Array(2).fill(0).map(() => getRandomCard()));
		this._movesLeft = getMovesCount(this._hands[this.playerMove].length);
		const events: Events = [{ name: 'player_switch', toPlayer: this.playerMove }];
		for (let tokenIndex = 0; tokenIndex < this._table[this.playerMove].length; tokenIndex += 1) {
			const token = this._table[this.playerMove][tokenIndex];
			if (token.humility === token.wildness) continue;
			this._hp[this.playerMove] -= token.uncontrollability;
			token.humility++;
			events.push(
				{ name: 'damage_for_wild', player: this.playerMove, value: token.uncontrollability },
				{ name: 'add_humility_token', toMonster: tokenIndex },
			);
			if (this._hp[this.playerMove] > 0) continue;
			events.push({ name: 'victory', ofPlayer: player });
			this._state = STATE.END_OF_THE_GAME;
			return { events, variants: [] };
		}
		this._state = STATE.CALL_OF_MONSTERS;
		const availableMoves = this.getAvailableMoves();
		if (availableMoves.length === 0) {
			const { events: nextEvents, variants } = this.endMove(this.playerMove);
			return { events: [...events, ...nextEvents], variants };
		}
		return { events, variants: availableMoves };
	}

	private _onlyByCurrentPlayer(player: number) {
		if (player !== this.playerMove) throw new Error('invalid player');
	}

	private _onlyOnMonstersCalling() {
		if (this.state !== STATE.CALL_OF_MONSTERS) throw new Error('not a monster calling status');
	}
}
