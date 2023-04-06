
const Cell = ({ keyVal, isAlive, onClickCallBack }) => {
    return (
        <div
            onClick={onClickCallBack}
            className={`cell${isAlive ? ' alive' : ''}`
            }
            data-testid={`cell${isAlive ? '-alive' : ''}-${keyVal}`}
        >
        </div>
    )
}

export default Cell;