import { Button } from 'antd';
import { useState } from 'react';

import './Counter.css';

export default function Counter() {
    const [count, setCount] = useState(0);
    const increase = () => {
        setCount(count + 1);
    };
    const double = () => {
        setCount(count * 2);
    };

    return (
        <div className="counter">
            <h3 className="count">{count}</h3>
            <div className="operations">
                <Button onClick={increase}>+1</Button>
                <Button onClick={double}>x2</Button>
            </div>
        </div>
    );
}
