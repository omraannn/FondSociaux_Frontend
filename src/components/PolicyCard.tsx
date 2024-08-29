import { Modal, Button } from 'antd';
import  { useState } from 'react';
import moment from "moment";


const PolicyCard = ({ policy }) => {

    const [isModalVisible, setIsModalVisible] = useState(false);


    /*|--------------------------------------------------------------------------
    |  Handle modal visibility
    |-------------------------------------------------------------------------- */
    const showModal = () => setIsModalVisible(true);
    const handleOk = () => setIsModalVisible(false);
    const handleCancel = () => setIsModalVisible(false);


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="feature text-center is-revealing" onClick={showModal} style={{cursor: 'pointer'}}>
                <div className="feature-inner">
                    <div className="feature-icon" style={{background: '#FFD2DA'}}>
                        <svg width="88" height="88" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" fillRule="nonzero">
                                <path d="M43 47v7a13 13 0 0 0 13-13v-7c-7.18 0-13 5.82-13 13z"
                                      fill="#FF6381"/>
                                <path d="M32 41v4a9 9 0 0 0 9 9v-4a9 9 0 0 0-9-9z" fill="#FF97AA"/>
                            </g>
                        </svg>
                    </div>
                    <h4 className="feature-title h3-mobile mt-3 mb-8">{policy.title}</h4>
                    <p className="text-sm">{policy.sub_description}.</p>
                </div>
            </div>

            {/* ------- Policy details modal -------*/}
            <Modal
                title={policy.title}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                footer={[
                    <Button className="d-none" key="back" onClick={handleCancel}>
                        Cancel
                    </Button>,
                    <Button className="d-none" key="submit" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                <div style={{fontSize: '16px', lineHeight: '1.6'}}>
                    <div dangerouslySetInnerHTML={{__html: policy.description}}/>
                    <p className="text-muted mb-0 mt-3 badge">Publié
                        le {moment(policy.created_at).format('YYYY-MM-DD')}</p>
                </div>
            </Modal>
        </>
    );
};

export default PolicyCard;