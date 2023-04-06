import { render } from "@testing-library/react";
import renderer, { act } from 'react-test-renderer';
import Board from "./Board";
import React from "react";

describe(Board, () => {
    const countNumberOfAliveCells = (result) => {
        return result.queryAllByTestId('cell-alive', { exact: false }).length;
    }

    const getVisibleAliveCells = (result) => {
        const visibleAliveCells = result.queryAllByTestId('cell-alive', { exact: false })
            .map(cell => cell.getAttribute('data-testid').split('-')[2]);
        return JSON.stringify(visibleAliveCells);
    }

    it('board displays correct initial grid', () => {
        const { getByRole } = render(<Board />);
        const rangeInput = getByRole('slider');
        expect(Number(rangeInput.value)).toEqual(7);
    });

    it('board renders correctly', () => {
        const result = renderer
            .create(<Board />)
            .toJSON();
        expect(result).toMatchSnapshot();
    });

    it('board has correct number of live cells after generating next state', () => {
        const result = render(<Board />);
        expect(countNumberOfAliveCells(result)).toEqual(9);

        const nextBtn = result.getByRole('button', { name: 'Next' });
        const resetBtn = result.getByRole('button', { name: 'Reset' });
        act(() => {
            resetBtn.click();
            nextBtn.click();
            nextBtn.click();
        });
        expect(countNumberOfAliveCells(result)).toEqual(11);
    });

    it('board has correct number of live cells after pressing clear', () => {
        const result = render(<Board />);
        expect(countNumberOfAliveCells(result)).toEqual(9);

        const clearBtn = result.getByRole('button', { name: 'Clear' });
        act(() => {
            clearBtn.click();
        });
        expect(countNumberOfAliveCells(result)).toEqual(0);
    });

    it('board has correct set of alive cells', () => {
        const result = render(<Board />);

        const cells = getVisibleAliveCells(result);
        const expectedCells = '["9,23","10,10","10,11","10,12","10,22","11,10","11,22","11,23","11,24"]';

        expect(cells).toEqual(expectedCells);
    });

    it('board has correct set of alive cells after 50 iterations', () => {
        const result = render(<Board />);
        const nextBtn = result.getByRole('button', { name: 'Next' });
        act(() => {
            for (let i of Array(50).keys()) {
                nextBtn.click();
            }
        });

        const cells = getVisibleAliveCells(result);
        const expectedCells = '["9,10","9,11","10,9","10,12","11,10","11,11","22,10","23,10","23,12","24,10","24,11"]';

        expect(cells).toEqual(expectedCells);
    });

    it('board has correct set of alive cells after user clicks on cells', () => {
        const result = render(<Board />);
        const clearBtn = result.getByRole('button', { name: 'Clear' });
        const cellIds = ['cell-9,0', 'cell-10,0', 'cell-11,0'];
        const clickedCells = cellIds.map(cellId => result.getByTestId(cellId));

        act(() => {
            clearBtn.click();
        })
        act(() => {
            clickedCells.map(cell => cell.click());
        })

        const cells = getVisibleAliveCells(result);
        const expectedCells = '["9,0","10,0","11,0"]';

        expect(cells).toEqual(expectedCells);
    });

    it('board keeps track of alive cells that are outside the visible grid', () => {
        const result = render(<Board />);
        const clearBtn = result.getByRole('button', { name: 'Clear' });
        const cellIds = ['cell-9,0', 'cell-10,0', 'cell-11,0'];
        const clickedCells = cellIds.map(cellId => result.getByTestId(cellId));

        act(() => {
            clearBtn.click();
        })
        act(() => {
            clickedCells.map(cell => cell.click());
        })

        const cells = getVisibleAliveCells(result);
        const expectedCells = '["9,0","10,0","11,0"]';

        expect(cells).toEqual(expectedCells);

        // click "nextBtn" two times, alive cells go outside board area and come back
        const nextBtn = result.getByRole('button', { name: 'Next' });
        act(() => {
            nextBtn.click();
        });
        const expectedCells2 = '["10,0","10,1"]';
        expect(getVisibleAliveCells(result))
            .toEqual(expectedCells2);
        act(() => {
            nextBtn.click();
        });
        expect(getVisibleAliveCells(result))
            .toEqual(expectedCells);
    });
})