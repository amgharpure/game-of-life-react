
const Cell = ({ isAlive, onClickCallBack }) => {
    return (
        <div
            onClick={onClickCallBack}
            className={`cell ${isAlive ? 'alive' : ''}`
            }
        >
        </div>
    )
}

export default Cell;