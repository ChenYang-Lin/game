import DropItem from "./DropItem.js";

export default class MatterEntity extends Phaser.Physics.Matter.Sprite {
    constructor(data) {
        let { name, scene, x, y, health, drops, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);

        
    }
}