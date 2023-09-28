let WORLD_DATA = {}
let INVENTORY_DATA = {}

const loadWorldData = () => {
    WORLD_DATA = JSON.parse(localStorage.getItem("WORLD_DATA"));
}

const saveWorldData = () => {
    window.localStorage.setItem("WORLD_DATA", JSON.stringify(WORLD_DATA));
}

const loadInventoryData = () => {
    INVENTORY_DATA = JSON.parse(localStorage.getItem("INVENTORY_DATA"));
}

const saveInventoryData = () => {
    window.localStorage.setItem("INVENTORY_DATA", JSON.stringify(INVENTORY_DATA));
}

const ITEM_DATA = {
    tree: {
        type: "resource",
        texture: "resources",
        frame: "tree",
        offsetY: 0,
        is_obstacle: true,
        maxHP: 5,
        drops: {
            wood: 5,
        },
    },
    rock: {
        type: "resource",
        texture: "resources",
        frame: "rock",
        offsetY: 0,
        is_obstacle: true,
        maxHP: 5,
        drops: {
            stone: 5,
        },
    },
    bush: {
        type: "resource",
        texture: "resources",
        frame: "bush",
        offsetY: 0,
        is_obstacle: true,
        maxHP: 5,
        drops: {
            fiber: 1,
        },
    },
    wood: {
        type: "material",
        texture: "items",
        frame: "wood",
    },
    stone: {
        type: "material",
        texture: "items",
        frame: "stone",
    },
    fiber: {
        type: "material",
        texture: "items",
        frame: "fiber",
    },
    carrotseed: {
        type: "material",
        texture: "crops",
        frame: "carrot",
        growingTime: 20,
        HarvestQuantity: 2,
        exp: 2,
        drops: {
            carrot: 2,
        }
    },
    carrot: {
        type: "material",
        texture: "crops",
        frame: "carrot",
    }
}

const CROP_DATA = {
    carrot: {
        growingTime: 20,
        seedPurchasePrice: 10,
        seedSellingPrice: 8,
        cropPurchasePrice: 15,
        cropSellingPrice: 10,
        HarvestQuantity: 2,
        exp: 2,
    },
    broccoli: {
        growingTime: 5,
        seedPurchasePrice: 5,
        seedSellingPrice: 4,
        cropPurchasePrice: 8,
        cropSellingPrice: 5,
        HarvestQuantity: 1,
        exp: 1,
    }
}


export { CROP_DATA, 
    ITEM_DATA,
    WORLD_DATA, 
    loadWorldData, 
    saveWorldData,
    INVENTORY_DATA,
    loadInventoryData,
    saveInventoryData,
}