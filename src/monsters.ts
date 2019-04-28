import { IMonster } from "./ICard";

const monsters: Array<IMonster> = [{
	id: 'monster/eclipse-bird',
	cost: 2,
	power: 1,
	max_hp: 2,
	regen: 1,
	uncontrollability: 3,
	wildness: 3,
	// before the eclipse bird is damaged,
	// you can spend 3 lives and give it physical immunity until the end of the turn
}, {
	id: 'monster/yith',
	cost: 1,
	power: 2,
	max_hp: 5,
	regen: 2,
	uncontrollability: 1,
	wildness: null,
	// before starting your turn, if Yith is not yet tamed, you can tame him by skipping the next turn
}];

export default monsters;
