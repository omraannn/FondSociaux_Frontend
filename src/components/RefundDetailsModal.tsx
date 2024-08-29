import { Modal, Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";
import moment from 'moment';
import { assets } from "../assets/images/assets";
import { useState } from "react";
import {DOC_URL} from "../utils/env";


const RefundDetailsModal = ({ isModalOpen, handleCancel, selectedRefund }) => {

    const [documentUrl, setDocumentUrl] = useState('');


    /*|--------------------------------------------------------------------------
    |  Handle status cases
    |-------------------------------------------------------------------------- */
    let statusColor, statusText, cardTextColor;
    switch (selectedRefund.status) {
        case 'pending':
            statusColor = 'processing';
            statusText = 'en cours de traitement...';
            cardTextColor = 'info';
            break;
        case 'accepted':
            statusColor = 'success';
            statusText = 'accepté';
            cardTextColor = 'success';
            break;
        case 'rejected':
            statusColor = 'error';
            statusText = 'rejeté';
            cardTextColor = 'danger';
            break;
        default:
            statusColor = '';
            cardTextColor = '#ffffff';
    }


    /*|--------------------------------------------------------------------------
    |  Handle modal visibility
    |-------------------------------------------------------------------------- */
    const openDocumentModal = (documentPath) => setDocumentUrl(documentPath);
    const handleDocumentModalCancel = () => setDocumentUrl('');


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
      <>
          <Modal open={isModalOpen} onCancel={handleCancel} footer={null}>
              <div className="content">
                  <div className="receipt">
                      <div className="head border-bottom pb-2 mb-4">
                          <h1 className="fs-4 text-secondary mb-4 mt-4">
                              Les informations du collaborateur
                          </h1>
                          <div className="row">
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">Nom et prénom:</span>
                                      <span
                                          className="fs-6">{selectedRefund.user.firstname} {selectedRefund.user.lastname}</span>
                                  </div>
                              </div>
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">Email:</span>
                                      <span className="fs-6">{selectedRefund.user.email}</span>
                                  </div>
                              </div>
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">CIN:</span>
                                      <span className="fs-6">{selectedRefund.user.cin}</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="head pb-2 mb-3">
                          <h1 className="fs-5 text-secondary mb-4">
                              Les détails de la demande de remboursement
                          </h1>
                          <div className="row">
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">Le sujet de la demande:</span>
                                      <span className="fs-6">{selectedRefund.subject}</span>
                                  </div>
                              </div>
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">Le type de frais:</span>
                                      <span className="fs-6">{selectedRefund.type_fee.title}</span>
                                  </div>
                              </div>
                              {
                                  selectedRefund.type_fee.refund_type === 'percentage' ? (
                                      <div className="col-md-12 mb-2">
                                          <div className="account-item">
                                              <span
                                                  className="fs-6 text--gray me-2">Le pourcentage de remboursement:</span>
                                              <span className="fs-6">{selectedRefund.type_fee.percentage} %</span>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="col-md-12 mb-2">
                                          <div className="account-item">
                                              <span
                                                  className="fs-6 text--gray me-2">Le prix unitaire:</span>
                                              <span className="fs-6">{selectedRefund.type_fee.unit_price} TND</span>
                                          </div>
                                      </div>
                                  )
                              }

                              {
                                  selectedRefund.type_fee.refund_type === 'percentage' ? (
                                      <div className="col-md-12 mb-2">
                                          <div className="account-item">
                                              <span className="fs-6 text--gray me-2">Le montant dépensé:</span>
                                              <span className="fs-6">{selectedRefund.amount_spent} TND</span>
                                          </div>
                                      </div>
                                  ) : (
                                      <>

                                          <div className="col-md-12 mb-2">
                                              <div className="account-item">
                                                  <span className="fs-6 text--gray me-2">Le nombre des unités:</span>
                                                  <span className="fs-6">{selectedRefund.quantity}</span>
                                              </div>
                                          </div>

                                          <div className="col-md-12 mb-2">
                                              <div className="account-item">
                                                  <span className="fs-6 text--gray me-2">Le tolal:</span>
                                                  <span
                                                      className="fs-6">{selectedRefund.quantity * selectedRefund.type_fee.unit_price} TND</span>
                                              </div>
                                          </div>

                                      </>
                                  )
                              }


                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">Le plafond du frais:</span>
                                      {
                                         selectedRefund.type_fee.ceiling_type === "none" && (
                                             <span className="text-danger">----</span>
                                          )
                                      }
                                      {
                                          selectedRefund.type_fee.ceiling_type === "per_day" && (
                                              <span className="text-danger">{selectedRefund.type_fee.ceiling} TND / Jour</span>
                                          )
                                      }
                                      {
                                          selectedRefund.type_fee.ceiling_type === "per_year" && (
                                              <span className="text-danger">{selectedRefund.type_fee.ceiling} TND / Année</span>
                                          )
                                      }
                                  </div>
                              </div>
                              <div className="col-md-12 mb-2">
                                  <div className="account-item">
                                      <span className="fs-6 text--gray me-2">La date de dépense :</span>
                                      <span
                                          className="fs-6">{moment(selectedRefund.expense_date).format('YYYY-MM-DD')}</span>
                                  </div>
                              </div>
                              <div className="col-md-12 mt-2 mb-2 border-2 border">
                                  <div className="text-center p-4 d-flex justify-content-center flex-column gap-2">
                                      <h3 className="fs-6 text--gray me-2">LE MONTANT DE REMBOURSEMENT</h3>
                                      <h2 className={`fs-2 text-${cardTextColor}`}>
                                          {selectedRefund.reimbursement_amount} TND
                                      </h2>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="head border-bottom pb-4 mb-4">
                          <h1 className="light fs-5 title text-secondary mb-3">
                              Les documents justificatifs
                          </h1>
                          <div className="document-content d-flex gap-2 align-items-center">
                              {selectedRefund.refund_documents.map(document => (
                                  <div key={document.id} className="mb-2">
                                      <a href="#" onClick={() => openDocumentModal(`${DOC_URL}${document.document_path}`)}>
                                          <img width={80} src={assets.pdfIcon} alt="pdf" />
                                      </a>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="head mb-4">
                          <div className="document-content">
                              <Tag className="w-100 p-4 text-center" color={statusColor}>
                                  {selectedRefund.HR_comment && (
                                      <div className="d-flex justify-content-center flex-wrap">
                                          <p>
                                              <strong className="d-block mb-2">Commentaire admin RH </strong>
                                              <span className="d-block mb-3">{selectedRefund.HR_comment}</span>
                                          </p>
                                      </div>
                                  )}
                                  {selectedRefund.status === 'pending' &&
                                      <span>
                                            <SyncOutlined spin /> Votre demande est en cours de traitement
                                        </span>
                                  }
                                  {selectedRefund.status === 'accepted' &&
                                      <span>
                                            <CheckCircleOutlined /> Votre demande est acceptée
                                        </span>
                                  }
                                  {selectedRefund.status === 'rejected' &&
                                      <span>
                                            <CloseCircleOutlined /> Votre demande est rejetée
                                        </span>
                                  }
                              </Tag>
                          </div>
                      </div>
                  </div>
              </div>


              {/* ------- Modal to display PDF document ------- */}
              <Modal
                  open={!!documentUrl}
                  onCancel={handleDocumentModalCancel}
                  footer={null}
              >
                  <iframe
                      src={documentUrl}
                      width="100%"
                      height="500px"
                      title="Document PDF"
                  />
              </Modal>
          </Modal>
      </>
    );
};

export default RefundDetailsModal;