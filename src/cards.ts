import { IMonster } from "./ICard";
import monsters from "./monsters";

const cards: Array<IMonster> = [
	...monsters,
];

const cardWithId: { [cardId: string]: IMonster } = {};

for (const card of cards) {
	if (cardWithId[card.id]) throw new Error(`card's ids duplicate: ${card.id}`);
	cardWithId[card.id] = card;
}

export default cardWithId;

export function getRandomCard() {
	return cards[Math.floor(Math.random() * cards.length)];
}
