import { Card, Tag } from "antd";
import { assets } from "../assets/images/assets";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { truncateTitle } from "../utils/truncateFunc";


const RefundDemandCard = ({ refund, handleShowModalRefundDetails }) => {

    let statusColor, statusIcon, statusText, cardTextColor;


    /*|--------------------------------------------------------------------------
    |  Handle status cases
    |-------------------------------------------------------------------------- */
    switch (refund.status) {
        case 'pending':
            statusColor = 'processing';
            statusIcon = <SyncOutlined spin />;
            statusText = 'en cours de traitement...';
            cardTextColor = 'info';
            break;
        case 'accepted':
            statusColor = 'success';
            statusIcon = <CheckCircleOutlined />;
            statusText = 'accepté';
            cardTextColor = 'success';
            break;
        case 'rejected':
            statusColor = 'error';
            statusIcon = <CloseCircleOutlined />;
            statusText = 'rejeté';
            cardTextColor = 'danger';
            break;
        default:
            statusColor = '';
            statusIcon = null;
            statusText = '';
            cardTextColor = '#ffffff';
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="col-lg-3 col-md-4 col-sm-6 col-12">
                <Card className="h-100" style={{cursor: 'pointer'}}
                      onClick={() => handleShowModalRefundDetails(refund)}>
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="images-circles">
                                <img
                                    src={refund.status === 'pending' ? assets.blueCircle : (refund.status === 'accepted' ? assets.greenCircle : assets.redCircle)}
                                    alt="refund"
                                    width={20}
                                    height={20}
                                />
                            </div>
                            <div className="tags">
                                <Tag className="me-0" icon={statusIcon} color={statusColor}>
                                    {statusText}
                                </Tag>
                            </div>
                        </div>

                        <div className="w-100 d-flex align-items-end justify-content-between">
                            <div>
                                <h5 className="fs-5 mb-1">{truncateTitle(refund.subject)}</h5>
                                <small>
                                    {refund.status === 'pending' ? 'Demande en cours de vérification...' : (refund.status === 'accepted' ? 'Votre demande est acceptée...' : 'Votre demande est rejetée...')}
                                </small>
                            </div>
                            <div className={`text-${cardTextColor} fw-bold fs-6 me-1`}>
                                {refund.reimbursement_amount} TND
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default RefundDemandCard;