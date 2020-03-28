export class Maze {
	private tilemap:number[][];

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

	private open_holes(map:number[][]) {
		for (var y = 1; y < map.length - 1; y++) {
			for (var x = 1; x < map[y].length - 1 ; x++) {
				if (map[y][x] != 1) {
					continue;
				}
				if (Math.random() < 0.2) {
					map[y][x] = 0;
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
