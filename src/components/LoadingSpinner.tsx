import {Spin} from 'antd';

const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', marginTop: '20px', height:'70vh' }} className="d-flex justify-content-center align-items-center">
        <Spin size="large" />
    </div>
);

export default LoadingSpinner;