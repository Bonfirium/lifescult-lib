export default interface ICard {
	id: string;
}

export interface IMonster extends ICard {
	cost: number;
	power: number;
	max_hp: number;
	regen: number;
	wildness: number | null;
	uncontrollability: number;
}
