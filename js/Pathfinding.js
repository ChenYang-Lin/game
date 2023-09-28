

class Node {
    constructor(pos, goal, parent) {
        this.tx = pos.tx;
        this.ty = pos.ty;
        this.parent = parent || null;
        
        // g(n) the exact cost of the path from the starting point to any vettex n
        this.g = this.parent ? this.parent.g + 1 : 0;

        // h(n) the heuristic estimated cost from vertex to the goal
        this.h = this.calcHeuristic(pos, goal);

        // f(n) = g(n) + h(n)
        this.f = this.g + this.h;
    }


    calcHeuristic = function(pos, goal) {
        const movementCost = 1;

        let dx = Math.abs(goal.tx - pos.tx);
        let dy = Math.abs(goal.ty - pos.ty);

        return movementCost * (dx + dy);
    }
}

class Astar {
    constructor() {
        this.OPEN = [];
        this.CLOSED = [];

        this.indicators = [];
    
        this.START;
        this.GOAL;
    
        this.GRID;
    }

    findPath = function(grid, start, goal, scene) {
        this.indicators.forEach(rect => rect.destroy())
        
        // Init
        this.GRID = {...grid};

        this.START = new Node(start, goal);
        this.GOAL = new Node(goal, goal);

        this.OPEN = [ this.START ];
        this.CLOSED = [];

        // Empty grid
        if (this.GRID.length <= 0) return;
        // Start and goal are the same time
        if (this.START.tx === this.GOAL.tx && this.START.ty === this.GOAL.ty) return;
        // Goal undefined
        if (!goal.tx || !goal.ty) return;
        // GOAL is on a blocked tile 
        let coordinate = `${this.GOAL.tx},${this.GOAL.ty}`;
        if (this.GRID[coordinate] !== undefined && this.GRID[coordinate]?.is_obstacle) return;

        // 
        while (this.OPEN.length > 0) {
            // Get best node n from OPEN
            let n = this.getLowestFromOpen();
            this.removeLowestFromOpen();
            this.CLOSED.push(n);


            // n is the goal, we are done
            if (n.tx == this.GOAL.tx && n.ty == this.GOAL.ty) {
                this.GOAL = n;
                break;
            }

            // Examine neighbors of n
            let children = this.getNeighbors(n);

            for (let i = 0; i < children.length; i++) {
                let child = children[i];

                if (this.getNodeIndexInList(this.CLOSED, child) > 0) continue;

                // indicator
                this.drawRectangle(scene, child, 0x0000ff);

                // child.g = n.g + 1;
                // child.h = n.calcHeuristic(child, this.GOAL);
                // child.f = child.g + child.h;

                // let index = this.getNodeIndexInList(this.OPEN, child)

                // if (index >= 0) {
                //     if (child.g > this.OPEN[index].g) continue;
                // }

                this.OPEN.push(child);
            }
        }

        // Find path by following parents from GOAL to START
        let path = [];
        let current = this.GOAL;

        while (current) {
            // indicator
            this.drawRectangle(scene, current, 0xff0000);

            path.unshift(current);
            current = current.parent;
        }

        path.splice(0, 1);
        return path;
    }

    getLowestFromOpen = function() {
        let lowest = this.OPEN[0];

        for (let i = 0; i < this.OPEN.length; i++) {
            if (this.OPEN[i].f <= lowest.f) {
                lowest = this.OPEN[i];
            }
        };

        return lowest;
    }

    removeLowestFromOpen = function() {
        let index = 0;
        let lowest = this.OPEN[index];

        for (let i = 0; i < this.OPEN.length; i++) {
            if (this.OPEN[i].f <= lowest.f) {
                index = i;
                lowest = this.OPEN[i];
            }
        }

        this.OPEN.splice(index, 1);
    }

    getNeighbors = function(node) {
        let neighbors = [];

        // Left neighbor
        if (node.tx - 1 >= 0 && this.checkWalkable(node, "left")) {
            let pos = { tx: node.tx - 1, ty: node.ty };
            neighbors.push(new Node(pos, this.GOAL, node));
        }

        // Right neighbor
        if (node.tx + 1 < 100 && this.checkWalkable(node, "right")) {
            let pos = { tx: node.tx + 1, ty: node.ty };
            neighbors.push(new Node(pos, this.GOAL, node));
        }

        // Up neighbor
        if (node.ty - 1 >= 0 && this.checkWalkable(node, "up")) {
            let pos = { tx: node.tx, ty: node.ty - 1 };
            neighbors.push(new Node(pos, this.GOAL, node));
        }

        // Down neighbor
        if (node.ty + 1 < 100 && this.checkWalkable(node, "down")) {
            let pos = { tx: node.tx, ty: node.ty + 1 };
            neighbors.push(new Node(pos, this.GOAL, node));
        }

        // // Up-Left neighbor
        // if (node.ty - 1 >= 0 && node.tx - 1 >= 0 && this.checkWalkable(node, "up-left")) {
        //     let pos = { tx: node.tx - 1, ty: node.ty - 1 };
        //     neighbors.push(new Node(pos, this.GOAL, node));
        // }

        // // Up-Right neighbor
        // if (node.ty - 1 >= 0 && node.tx + 1 < 100 && this.checkWalkable(node, "up-right")) {
        //     let pos = { tx: node.tx + 1, ty: node.ty - 1 };
        //     neighbors.push(new Node(pos, this.GOAL, node));
        // }

        // // Down-Left neighbor
        // if (node.ty + 1 < 100 && node.tx - 1 >= 0 && this.checkWalkable(node, "down-left")) {
        //     let pos = { tx: node.tx - 1, ty: node.ty + 1 };
        //     neighbors.push(new Node(pos, this.GOAL, node));
        // }

        // // Down-Right neighbor
        // if (node.ty + 1 < 100 && node.tx + 1 < 100 && this.checkWalkable(node, "down-right")) {
        //     let pos = { tx: node.tx + 1, ty: node.ty + 1 };
        //     neighbors.push(new Node(pos, this.GOAL, node));
        // }

        // Return all neighbors
        return neighbors;
    }

    checkWalkable = function(n, dir) {
        let direction = dir || "";
        let is_walkable = true;

        switch(direction.toLowerCase()) {
            case "left":
                is_walkable = (this.GRID[`${n.tx-1},${n.ty}`] !== undefined && this.GRID[`${n.tx-1},${n.ty}`]?.is_obstacle) ? false : true;
                break;
            case "right":
                is_walkable = (this.GRID[`${n.tx+1},${n.ty}`] !== undefined && this.GRID[`${n.tx+1},${n.ty}`]?.is_obstacle) ? false : true;
                break;
            case "up":
                is_walkable = (this.GRID[`${n.tx},${n.ty-1}`] !== undefined && this.GRID[`${n.tx},${n.ty-1}`]?.is_obstacle) ? false : true;
                break;
            case "down":
                is_walkable = (this.GRID[`${n.tx},${n.ty+1}`] !== undefined && this.GRID[`${n.tx},${n.ty+1}`]?.is_obstacle) ? false : true;
                break;
            // case "up-left":
            //     is_walkable = (this.GRID[`${n.tx-1},${n.ty-1}`] !== undefined && this.GRID[`${n.tx-1},${n.ty-1}`]?.is_obstacle) ? false : true;
            //     break;
            // case "up-right":
            //     is_walkable = (this.GRID[`${n.tx+1},${n.ty-1}`] !== undefined && this.GRID[`${n.tx+1},${n.ty-1}`]?.is_obstacle) ? false : true;
            //     break;
            // case "down-left":
            //     is_walkable = (this.GRID[`${n.tx-1},${n.ty+1}`] !== undefined && this.GRID[`${n.tx-1},${n.ty+1}`]?.is_obstacle) ? false : true;
            //     break;
            // case "down-right":
            //     is_walkable = (this.GRID[`${n.tx+1},${n.ty+1}`] !== undefined && this.GRID[`${n.tx+1},${n.ty+1}`]?.is_obstacle) ? false : true;
            //     break;
            default:
                is_walkable = (this.GRID[`${n.tx},${n.ty}`] !== undefined && this.GRID[`${n.tx},${n.ty}`]?.is_obstacle) ? false : true;
        }

        return is_walkable;
    }

    getNodeIndexInList = function(arr, node) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].tx == node.tx && arr[i].ty == node.ty) {
                return i;
            }
        }
        return -1;
    }

    drawRectangle(scene, node, color) {
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(1, color, 1); // this.graphics.lineStyle(thickness, color, alpha)
        this.indicators.push(this.graphics.strokeRect(node.tx*32, node.ty*32, 32, 32));
    }
}


export { Astar }