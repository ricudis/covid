export class Maze {
	private tilemap:number[][];

	public static calculateMazeDimensions(gridSize: number, level: number = 1): {x: number, y: number} {
		// Get browser window dimensions
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;
		
		// Leave some margin for UI elements
		const availableWidth = windowWidth * 0.9; // 90% of window width
		const availableHeight = windowHeight * 0.8; // 80% of window height
		
		// The maze generation creates a tilemap of size (x*2+1) × (y*2+1)
		// So we need to calculate the base dimensions that will fit in the window
		const maxTilesX = Math.floor(availableWidth / gridSize);
		const maxTilesY = Math.floor(availableHeight / gridSize);
		
		// Convert from tilemap size back to maze base dimensions
		// If tilemap size is (x*2+1), then base dimension x = (tilemapSize - 1) / 2
		const maxMazeX = Math.floor((maxTilesX - 1) / 2);
		const maxMazeY = Math.floor((maxTilesY - 1) / 2);
		
		// Ensure minimum maze size and odd numbers for proper maze generation
		const minSize = 5;
		let x = Math.max(minSize, maxMazeX % 2 === 0 ? maxMazeX - 1 : maxMazeX);
		let y = Math.max(minSize, maxMazeY % 2 === 0 ? maxMazeY - 1 : maxMazeY);
		
		// Increase maze size by 15% for each level (but ensure it still fits in window)
		if (level > 1) {
			const levelMultiplier = Math.pow(1.15, level - 1); // 15% increase per level
			const newX = Math.floor(x * levelMultiplier);
			const newY = Math.floor(y * levelMultiplier);
			
			// Ensure the enlarged maze still fits in the window
			const maxPossibleX = Math.floor((maxTilesX - 1) / 2);
			const maxPossibleY = Math.floor((maxTilesY - 1) / 2);
			
			x = Math.min(newX, maxPossibleX % 2 === 0 ? maxPossibleX - 1 : maxPossibleX);
			y = Math.min(newY, maxPossibleY % 2 === 0 ? maxPossibleY - 1 : maxPossibleY);
			
			// Ensure minimum size and odd numbers
			x = Math.max(minSize, x % 2 === 0 ? x - 1 : x);
			y = Math.max(minSize, y % 2 === 0 ? y - 1 : y);
		}
		
		return {x, y};
	}

	public get_tilemap():number[][] {
		return this.tilemap;
	}

	public get_dim_x():number {
		return this.tilemap[0].length;
	}

	public get_dim_y():number {
		return this.tilemap.length;
	}

	public get_rand_x():number {
		return Math.floor(Math.random() * (this.get_dim_x()));
	}

	public get_rand_y():number {
		return Math.floor(Math.random() * (this.get_dim_y()));
	}
	
	public get_tile(map:number[][], x:number, y:number):number {
		if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) {
			return 0;
		}
 		return map[y][x];
	}

	private is_maze(map:number[][], x, y):number {
		return (this.get_tile(map, x,y) == 1 ? 1 : 0);
	}

	public is_maze_tile(map:number[][],x:number, y:number, v:number[]):boolean {
		var v1:number[];
		if (v[0] == this.is_maze(map, x, y-1) && v[1] == this.is_maze(map, x, y+1) &&
			v[2] == this.is_maze(map, x-1, y) && v[3] == this.is_maze(map, x+1, y)) {
				return true;
		}
		return false;
	}

	private make_maze(y:number,x:number) {
		var n:number = x*y - 1;
		var horiz:boolean[][] = [];
		var verti:boolean[][] = [];
		var here:number[] = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)];
		var path:number[][] = [here];
		var unvisited:boolean[][] = [];
		var j = 0;
	
		for (var j = 0; j < x+2; j++) { 
			horiz[j] = [];
			verti[j] = [];
			unvisited[j] = [];
			for (var k = 0; k < y+1; k++) { 
				unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
			}
		}
	
		while (0 < n) {
			let potential:number[][] = [[here[0]+1, here[1]], [here[0],here[1]+1], [here[0]-1, here[1]], [here[0],here[1]-1]];
			let neighbors:number[][] = [];
			var next:number[] = [];
	
			for (var j = 0; j < 4; j++) {
				if (unvisited[potential[j][0]+1][potential[j][1]+1]) {
					neighbors.push(potential[j]);
				}
			}
			
			if (!neighbors.length) {
				here = path.pop();
				continue;
			}
	
			n = n-1;
			next = neighbors[Math.floor(Math.random()*neighbors.length)];
			unvisited[next[0]+1][next[1]+1] = false;
			if (next[0] == here[0]) {
				horiz[next[0]][(next[1]+here[1]-1)/2] = true;
			} else {
				verti[(next[0]+here[0]-1)/2][next[1]] = true;
			}
			here = next;
			if (1 < neighbors.length) {
				path.push(here);
			}
		}
		return ({x: x, y: y, horiz: horiz, verti: verti});
	}

	private inner_wall(map:number[][], x:number, y:number, i:number) {
		if (y == 1 && i == 0) return false;
		if (y == map.length - 2 && i == 1) return false;
		if (x == 1 && i == 2) return false;
		if (x == map[y].length - 2 && i == 3) return false;
		switch(i) {
			case 0: return (map[y - 1][x] == 1); break;
			case 1: return (map[y + 1][x] == 1); break;
			case 2: return (map[y][x - 1] == 1); break;
			case 3: return (map[y][x + 1] == 1); break;
			default:
				break;
		}
		return false;
	}

	private open_holes(map:number[][]) {
		// Remove dead ends
		for (var y = 1; y < map.length - 1; y++) {
			for (var x = 1; x < map[y].length - 1 ; x++) {
				if (map[y][x] != 0) {
					continue;
				}
				
				if ((map[y - 1][x] + (map[y + 1][x]) + (map[y][x - 1]) + (map[y][x + 1])) != 3) {
					continue;
				}

				var i:number;

				do {
					i = Math.floor(Math.random() * 4);
				} while (this.inner_wall(map, x, y, i) == false);
				
				switch(i) {
					case 0: map[y - 1][x] = 0; break;
					case 1: map[y + 1][x] = 0; break;
					case 2: map[y][x - 1] = 0; break;
					case 3: map[y][x + 1] = 0; break;
					default:
						break;
				}				
			}
		}
		return map;
	}

	private make_tilemap(maze):number[][] {
		var map:number[][] = [];
		var tmpmap:number[][] = [];

		for (var j:number = 0; j < maze.x * 2 + 1; j++) {
			var line:number[] = [];
			for (var k:number = 0; k < maze.y * 2 + 1; k++) {
				line[k] = 0;
				if ((j % 2 == 0 && (k % 2 == 0 || !(j > 0 && maze.verti[j / 2 - 1][Math.floor(k / 2)]))) ||
					(j % 2 != 0 && (k % 2 == 0 && !(k > 0 && maze.horiz[(j - 1)/2][k / 2 - 1])))) {
						line[k] = 1;
				} 
			}
			tmpmap.push(line);
		}

		// Open some holes
		tmpmap = this.open_holes(tmpmap);
		
		// Convert maze to tilemap
		for (var y:number = 0; y < tmpmap.length; y++) {
			var line:number[] = [];
			for (var x:number = 0; x < tmpmap[y].length; x++) {
				if (tmpmap[y][x] == 0) {
					line[x] = 0;
				} else
				if (this.is_maze_tile(tmpmap,x,y,[1,0,1,0])) { line[x] = 7; } else
            	if (this.is_maze_tile(tmpmap,x,y,[1,0,0,1])) { line[x] = 9; } else
     	       	if (this.is_maze_tile(tmpmap,x,y,[0,1,0,1])) { line[x] = 1; } else
       	     	if (this.is_maze_tile(tmpmap,x,y,[0,0,1,1])) { line[x] = 2; } else
       	     	if (this.is_maze_tile(tmpmap,x,y,[1,1,0,0])) { line[x] = 4; } else
       	     	if (this.is_maze_tile(tmpmap,x,y,[1,0,1,1])) { line[x] = 8; } else
       	     	if (this.is_maze_tile(tmpmap,x,y,[0,1,1,1])) { line[x] = 5; } else
            	if (this.is_maze_tile(tmpmap,x,y,[1,1,0,1])) { line[x] = 10; } else
            	if (this.is_maze_tile(tmpmap,x,y,[1,1,1,0])) { line[x] = 6; } else
            	if (this.is_maze_tile(tmpmap,x,y,[0,1,1,0])) { line[x] = 3; } else
            	if (this.is_maze_tile(tmpmap,x,y,[1,1,1,1])) { line[x] = 11; } else
            	if (this.is_maze_tile(tmpmap,x,y,[0,0,0,1])) { line[x] = 14; } else
            	if (this.is_maze_tile(tmpmap,x,y,[1,0,0,0])) { line[x] = 15; } else
            	if (this.is_maze_tile(tmpmap,x,y,[0,0,1,0])) { line[x] = 12; } else
            	if (this.is_maze_tile(tmpmap,x,y,[0,1,0,0])) { line[x] = 13; } else 
            	if (this.is_maze_tile(tmpmap,x,y,[0,0,0,0])) { line[x] = 16; }
			}
			map.push(line);
		}
		
		return map;
  	}

	constructor(x:number, y:number) {
		this.tilemap = this.make_tilemap(this.make_maze(x,y));
	}
}
