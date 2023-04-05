import { useEffect, useState, useRef, useCallback } from 'react';
import Cell from "./Cell";
const tupleDelimiter = ',';
const width = 40;
const height = 30;
const Board = () => {

    const [top, setTop] = useState(0);
    const [left, setLeft] = useState(0);
    const rows = Array.from(Array(height).keys()).map(x => x - top);
    const cols = Array.from(Array(width).keys()).map(x => x - left);

    const [aliveCells, setAliveCells] = useState(new Set());
    const aliveCellsRef = useRef(aliveCells);

    const [running, setRunning] = useState(false);
    const runningRef = useRef(running);
    runningRef.current = running;
    const [speed, setSpeed] = useState(7);
    const speedRef = useRef(speed);

    const clearBoard = () => {
        // 1. stop the simulation, 2. reset viewport and 3. Mark all cells as not alive
        runningRef.current = false;
        setRunning(false);
        setTop(0);
        setLeft(0);
        const cells = new Set();
        aliveCellsRef.current = cells;
        updateAliveCells(cells);
    }

    const resetBoard = () => {
        clearBoard();

        // create a few cell patterns on the grid
        const cells = new Set([
            '11,22', '10,22', '11,23', '11,24',
            '9,23', '10,10', '10,11', '10,12', '11,10'
        ]);
        aliveCellsRef.current = cells;
        updateAliveCells(cells);
    }

    useEffect(() => {
        resetBoard();
    }, []);

    const updateAliveCells = (aliveCells) => {
        // Create a copy of the set of live cells and set it to the state variable
        // this will re-render the baord
        const newAliveCells = new Set(aliveCells);
        setAliveCells(newAliveCells);
    }

    const toggleAliveCallback = (key) => {
        // change state of a cell identified by "key"
        if (aliveCells.has(key)) {
            aliveCells.delete(key);
        } else {
            aliveCells.add(key);
        }
        aliveCellsRef.current = aliveCells;
        updateAliveCells(aliveCells);
    }


    const runSimulation = useCallback(() => {
        // if simulation is not running, do nothing
        if (!runningRef.current) {
            return;
        }
        // if simulation is running, generate the next state and recur
        generateNextState();
        setTimeout(runSimulation, 1100 - (speedRef.current * 100));
    }, []);

    const generateNextState = () => {
        // For every cell that has a live neighbor, count the number of live neighbors it has
        const countMap = new Map();
        let dr, dc;
        // for every live cell, increment count of all its neighbors
        for (let key of aliveCellsRef.current) {
            let [rowId, colId] = key.split(tupleDelimiter);
            for ([dr, dc] of [
                [-1, -1], [1, 1], [1, -1], [-1, 1],
                [0, -1], [0, 1], [-1, 0], [1, 0]
            ]) {
                const neighborRowId = Number(rowId) + dr;
                const neighborColId = Number(colId) + dc;
                const neighborKey = neighborRowId + tupleDelimiter + neighborColId;
                countMap.set(neighborKey, (countMap.get(neighborKey) || 0) + 1);
            }
        }

        // calculate next state for each cell in the countMap based on:
        // 1. number of live neighbors
        // 2. current state of the cell
        const nextAliveCells = new Set();
        for (let [key, value] of countMap) {
            if (value === 3 || (value === 2 && aliveCellsRef.current.has(key))) {
                nextAliveCells.add(key);
            }
        }

        aliveCellsRef.current = nextAliveCells;
        updateAliveCells(aliveCellsRef.current);
    }

    const toggleRunning = () => {
        // Start or stop the cell generation simulation
        setRunning(!running);
        if (!running) {
            runningRef.current = true;
            runSimulation();
        }
    }

    const moveGrid = {
        // move the current viewport of the grid of cells
        'up': () => setTop(top + 5),
        'down': () => setTop(top - 5),
        'left': () => setLeft(left + 5),
        'right': () => setLeft(left - 5),
    };

    return (
        <div className="board">
            <div className="board-grid">
                {rows.map(rowId => {
                    return (
                        <div key={rowId} className={'board-grid-row'}>
                            {cols.map(colId => {
                                const key = rowId + tupleDelimiter + colId;
                                return (
                                    <Cell
                                        key={key}
                                        isAlive={aliveCells.has(key)}
                                        onClickCallBack={() => { toggleAliveCallback(key) }}
                                    />
                                )
                            }
                            )
                            }
                        </div>
                    )
                })}
            </div>
            <div className='board-controls'>
                <button onClick={clearBoard}>Clear</button>
                <button onClick={resetBoard}>Reset</button>
                <button onClick={generateNextState}>Next</button>
                <button
                    onClick={toggleRunning}
                    className={!running ? 'button-start' : 'button-stop'}>
                    {!running ? 'Start' : 'Stop'}
                </button>
                <div>
                    <button onClick={moveGrid['up']}>{'\u2191'}</button>
                    <button onClick={moveGrid['down']}>{'\u2193'}</button>
                    <button onClick={moveGrid['left']}>{'\u2190'}</button>
                    <button onClick={moveGrid['right']}>{'\u2192'}</button>
                </div>
                <label>Speed</label>
                <input
                    type='range'
                    value={speed}
                    min={1}
                    max={10}
                    onChange={e => {
                        setSpeed(Number(e.target.value));
                        speedRef.current = Number(e.target.value);
                    }}
                    className='slider'
                    readOnly
                />
            </div>
        </div>
    );
}

export default Board;