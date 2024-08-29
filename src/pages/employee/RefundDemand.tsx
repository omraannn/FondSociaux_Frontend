import {useEffect, useState} from 'react';
import {Steps, Button, Form, DatePicker, Upload, Select, Result, Modal} from 'antd';
import { UploadOutlined} from '@ant-design/icons';
import {CustomInput, LoadingSpinner, RefundDemandCard, RefundDetailsModal} from "../../components/index";
import refundService from "../../services/refundService";
import userService from "../../services/userService";
import { openNotificationWithIcon } from "../../utils/notificationUtils";
import typeFeesService from "../../services/typeFeesService";
import {handleError} from "../../utils/handleErrors";
import moment from "moment/moment.js";
import {assets} from "../../assets/images/assets";
import TypeFeesService from "../../services/typeFeesService";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";

const { Step } = Steps;
const { Option } = Select;

const RefundDemand = () => {

    const [current, setCurrent] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');


    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);


    const [subject, setSubject] = useState('');
    const [explanation, setExplanation] = useState('');
    const [quantity, setQuantity] = useState<any>('');
    const [amountSpent, setAmountSpent] = useState('');
    const [expenseDate, setExpenseDate] = useState<any>('');
    const [fileList, setFileList] = useState([]);


    const [typeFees, setTypeFees] = useState([]);
    const [typeFeeId, setTypeFeeId] = useState<any>(null);
    const [selectedTypeFee, setSelectedTypeFee] = useState<any>(null);
    const [typeFeeDetails, setTypeFeeDetails] = useState<any>(null);

    const [refunds, setRefunds] = useState([]);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [documentUrl, setDocumentUrl] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recapVisible, setRecapVisible] = useState(false);

    const user = JSON.parse(localStorage.getItem("USER_DETAILS") || '');

    const { handlePermissionErrors } = useHandlePermissionErrors();


    useEffect(() => {
        fetchTypeFeesAll()
        fetchLastRefundDemands()
        if (typeFeeId) {
            fetchTypeFeeDetails(typeFeeId);
        }
    }, [typeFeeId])


    /*|--------------------------------------------------------------------------
      |  Fetch type fee details - id
      |-------------------------------------------------------------------------- */
    const fetchTypeFeeDetails = async (id:any) => {
        try {
            const response = await TypeFeesService.getTypeFeesById(id);
            setTypeFeeDetails(response.typeFee);
            console.log(response.typeFee)
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Erreur lors de la récupération des détails du type de frais', error);
        }
    };

    /*|--------------------------------------------------------------------------
    |  Fetch last refund demands
    |-------------------------------------------------------------------------- */
    const fetchLastRefundDemands = async () => {
        try {
            setIsLoading(true);
            const response = await refundService.getLast8RefundDemands();
            setRefunds(response.refunds);
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching refunds:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des demandes de remboursements');
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Fetch type fees
    |-------------------------------------------------------------------------- */
    const fetchTypeFeesAll = async () => {
        try {
            setIsLoading(true);
            const response = await typeFeesService.getTypeFeesAll();
            setTypeFees(response.typeFees.reverse());
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching typeFees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des types de frais');
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle actions changes & validation
    |-------------------------------------------------------------------------- */
    const handleSubject = (e:any) => {
        const value = e.target.value;
        setSubject(value);
        if (!value) {
            setErrors((prev: any) => ({ ...prev, subject: 'Veuillez entrer le sujet de votre demande' }));
        } else {
            setErrors((prev: any) => ({ ...prev, subject: '' }));
        }
    };
    const handleExplanation = (e:any) => {
        const value = e.target.value;
        setExplanation(value);
        if (!value) {
            setErrors((prev: any) => ({ ...prev, message: 'Veuillez fournir une explication' }));
        } else {
            setErrors((prev: any) => ({ ...prev, message: '' }));
        }
    };
    const handleAmountSpent = (e:any) => {
        const value = e.target.value;
        setAmountSpent(value);
        if (!value) {
            setErrors((prev: any) => ({ ...prev, amountSpent: 'Veuillez entrer le montant dépensé' }));
        } else {
            setErrors((prev: any) => ({ ...prev, amountSpent: '' }));
        }
    };
    const handleQuatity = (e:any) => {
        const value = e.target.value;
        setQuantity(value);
        if (!value) {
            setErrors((prev: any) => ({ ...prev, quantity: 'Veuillez entrer le nombre des unité' }));
        } else {
            setErrors((prev: any) => ({ ...prev, quantity: '' }));
        }
    };
    const handleExpenseDateChange = (date:any) => {
        setExpenseDate(date);
        if (!date) {
            setErrors((prev: any) => ({ ...prev, expenseDate: 'Veuillez sélectionner la date de la dépense' }));
        } else {
            setErrors((prev: any) => ({ ...prev, expenseDate: '' }));
        }
    };
    const handleTypeFeeChange = (value:any) => {
        setTypeFeeId(value);
        setSelectedTypeFee(typeFees.find((fee:any) => fee.id === value) || null);
        if (!value) {
            setErrors((prev: any) => ({ ...prev, typeFeeId: 'Veuillez sélectionner un type de frais' }));
        } else {
            setErrors((prev: any) => ({ ...prev, typeFeeId: '' }));
        }
    };
    const handleFileListChange = ({ fileList }:any) => {
        setFileList(fileList);
        if (fileList.length === 0) {
            setErrors((prev: any) => ({ ...prev, supporting_documents: 'Veuillez télécharger les documents justificatifs' }));
        } else {
            setErrors((prev: any) => ({ ...prev, supporting_documents: '' }));
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle modal visibility
    |-------------------------------------------------------------------------- */
    const handleShowModalRefundDetails = (refund:any) => {
        setIsModalOpen(true);
        setSelectedRefund(refund);
    };

    const openRecapModal = () => {
        setRecapVisible(true);
    };

    const openDocumentModal = (document:any) => {
        const reader = new FileReader();

        reader.onload = (e:any) => {
            setDocumentUrl(e.target.result);
        };

        reader.readAsDataURL(document.originFileObj);
    };

    const handleDocumentModalCancel = () => setDocumentUrl('');

    const handleConfirm = () => {
        setRecapVisible(false);
        handleAddRefundDemand();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setRecapVisible(false);
        setSelectedRefund(null);
    };


    /*|--------------------------------------------------------------------------
    |  Handle form steps
    |-------------------------------------------------------------------------- */
    const next = () => {
        const currentErrors:any = {};

        if (current === 0) {
            if (!subject) currentErrors.subject = 'Veuillez entrer le sujet de votre demande';
            if (!explanation) currentErrors.explanation = 'Veuillez fournir une explication';
        } else if (current === 1) {
            if (!typeFeeId) currentErrors.typeFeeId = 'Veuillez sélectionner un type de frais';
            if (!expenseDate) currentErrors.expenseDate = 'Veuillez sélectionner la date de la dépense';

            if (selectedTypeFee) {
                if (selectedTypeFee.refund_type === 'percentage') {
                    if (!amountSpent) currentErrors.amount_spent = 'Veuillez entrer le montant dépensé';
                } else {
                    if (!quantity) currentErrors.quantity = 'Veuillez entrer la quantité';
                }
            }
        } else if (current === 2) {
            if (fileList.length === 0) currentErrors.supporting_documents = 'Veuillez télécharger les documents justificatifs';
        }

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
        } else {
            setCurrent(current + 1);
        }
    };

    const prev = () => setCurrent(current - 1);

    const steps = [
        {
            title: 'Informations Demande',
            content: (
                <>
                    <CustomInput
                        I_class_container="mb-3"
                        type="text"
                        label="Sujet de votre demande"
                        name="subject"
                        value={subject}
                        action={handleSubject}
                        error={errors.subject}
                    />

                    <CustomInput
                        I_class_container="mb-3"
                        I_class='pt-5 pb-5'
                        type="text"
                        label="Explication"
                        name="message"
                        value={explanation}
                        action={handleExplanation}
                        error={errors.explanation}
                    />
                </>
            ),
        },
        {
            title: 'Détails de la Dépense',
            content: (
                <>

                    <div className="d-flex align-items-center justify-content-center column-gap-3 flex-wrap ">
                        <Form.Item
                            className="mb-3"
                            validateStatus={errors.typeFeeId && 'error'}
                            help={errors.typeFeeId}
                            style={{maxWidth: "405px", width: "100%"}}
                        >
                            <Select
                                onChange={handleTypeFeeChange}
                                placeholder="Sélectionner un type de frais"
                                value={typeFeeId}
                            >
                                {typeFees && typeFees.length > 0 ? (
                                    typeFees.map((fee:any) => (
                                        <Option key={fee.id} value={fee.id} className="p-2">
                                            {fee.title}
                                        </Option>
                                    ))
                                ) : (
                                    <Option disabled value={null}>Aucun type de frais disponible</Option>
                                )}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            className="mb-3"
                            validateStatus={errors.expenseDate && 'error'}
                            help={errors.expenseDate}
                            style={{maxWidth: "405px", width: "100%"}}
                        >
                            <DatePicker
                                value={expenseDate}
                                onChange={handleExpenseDateChange}
                                style={{maxWidth: "405px", width: "100%"}}
                                placeholder="Sélectionner la date de votre dépense"
                            />
                        </Form.Item>
                    </div>

                    <>

                        {
                            selectedTypeFee && selectedTypeFee.refund_type === 'percentage' ? (
                                <CustomInput
                                    I_class_container="mb-3"
                                    type="number"
                                    label="Montant dépensé en TND"
                                    name="amount_spent"
                                    value={amountSpent}
                                    action={handleAmountSpent}
                                    error={errors.amount_spent}
                                />
                            ) : (
                                <CustomInput
                                    I_class_container="mb-3"
                                    type="number"
                                    label="Nombre des unités"
                                    name="quantity"
                                    value={quantity}
                                    action={handleQuatity}
                                    error={errors.quantity}
                                />
                            )
                        }

                    </>
                </>
            ),
        },
        {
            title: 'Documents Justificatifs',
            content: (
                <>
                    <Form.Item
                        className='mt-4 mb-5'
                    >
                        <Upload
                            fileList={fileList}
                            onChange={handleFileListChange}
                            beforeUpload={() => false}
                            accept=".pdf"
                        >
                            <Button icon={<UploadOutlined/>}>Télécharger Documents Justificatifs PDF</Button>
                        </Upload>
                        {errors.supporting_documents && <div className="p-1 text-danger">{errors.supporting_documents}</div>}

                    </Form.Item>


                    {selectedTypeFee && (
                        <div className="mb-5" dangerouslySetInnerHTML={{__html: selectedTypeFee.description}}/>
                    )}
                </>
            ),
        },
    ]


    /*|--------------------------------------------------------------------------
    | Send refund demand
    |----------------------------------------------------------------------------*/
    const handleAddRefundDemand = async () => {
        const user_id = await userService.getUserAuthId();
        try {
            const formData = new FormData();
            formData.append('user_id', user_id);
            formData.append('subject', subject);
            formData.append('type_fee_id', typeFeeId);
            formData.append('message', explanation);
            formData.append('amount_spent', amountSpent);
            formData.append('quantity', quantity);
            formData.append('expense_date', expenseDate ? expenseDate.format('YYYY-MM-DD') : '');
            fileList.forEach((file:any) => {
                formData.append('supporting_documents[]', file.originFileObj);
            });

            const response = await refundService.storeRefundDemand(formData);

            if (response.status !== "success") {
                openNotificationWithIcon('error', 'Erreur', response.message);
            } else {
                openNotificationWithIcon('success', 'Succès', response.message);
                setSuccessMessage(response.message);
                setIsSubmitted(true);
                setTimeout(() => {
                    setIsSubmitted(false);
                    resetStates();
                    window.location.href = ("/auth/employee/refunds/demand");
                }, 2000);
            }
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Fetch type fees
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
    setSubject('');
    setErrors({});
    setAmountSpent('');
    setExpenseDate('');
    setFileList([]);
    setExplanation('');
    setTypeFeeId(null);
    };


    if(isLoading) {
        return <LoadingSpinner/>
    }


    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                flexDirection: "column",
                minHeight: '100vh'
            }}>
                <div className="refund-demand-wrapper me-3 ms-3" style={{width: '100%'}}>
                    <h3 className="mb-4 fs-4 bg-white p-4 w-100">Demandes de remboursement</h3>
                    <div className="bg-white refund-content">
                        {isSubmitted ? (
                            <Result
                                status="success"
                                title="Demande de remboursement soumise avec succès!"
                                subTitle={successMessage}
                                extra={[
                                    <Button type="default" className="login-btn" key="console"
                                            onClick={() => setIsSubmitted(false)}>
                                        Revenir au formulaire
                                    </Button>
                                ]}
                            />
                        ) : (
                            <>
                                <Steps current={current}>
                                    {steps.map((item) => (
                                        <Step key={item.title} title={item.title}/>
                                    ))}
                                </Steps>
                                <Form layout="vertical" style={{marginTop: 16}}>
                                    <div className="steps-content">{steps[current].content}</div>
                                    <div className="steps-action">
                                        {current < steps.length - 1 && (
                                            <Button className="bg-dark" type="primary" onClick={next}>
                                                Suivant
                                            </Button>
                                        )}
                                        {current === steps.length - 1 && (
                                            <Button onClick={openRecapModal} className='bg-dark' type="primary">
                                                Soumettre
                                            </Button>
                                        )}
                                        {current > 0 && (
                                            <Button className="login-btn" style={{margin: '0 8px'}} onClick={prev}>
                                                Précédent
                                            </Button>
                                        )}
                                    </div>
                                </Form>
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="mb-4 mt-4 bg-white fs-4 p-4 w-100">Les dernières demandes envoyées</h3>
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>
                            {
                                refunds.map((refund, index) => (
                                    <RefundDemandCard key={index} refund={refund}
                                                      handleShowModalRefundDetails={handleShowModalRefundDetails}/>
                                ))
                            }
                        </div>
                    </div>

                    {/* ------------- display recap refund modal ------------- */}
                    <Modal open={recapVisible} onCancel={handleCancel}
                           footer={[
                               <Button key="back" onClick={() => setRecapVisible(false)}>
                                   Annuler
                               </Button>,
                               <Button key="submit" type="default" onClick={handleConfirm}>
                                   Confirmer
                               </Button>,
                           ]}
                    >
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
                                                    className="fs-6">{user.firstname} {user.lastname}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">Email:</span>
                                                <span className="fs-6">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">CIN:</span>
                                                <span className="fs-6">{user.cin}</span>
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
                                                <span className="fs-6">{subject}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">Message:</span>
                                                <span className="fs-6">{explanation}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">Le type de frais:</span>
                                                <span className="fs-6">{typeFeeDetails?.title}</span>
                                            </div>
                                        </div>
                                        {
                                            typeFeeDetails?.refund_type === 'percentage' ? (
                                                <div className="col-md-12 mb-2">
                                                    <div className="account-item">
                                              <span
                                                  className="fs-6 text--gray me-2">Le pourcentage de remboursement:</span>
                                                        <span className="fs-6">{typeFeeDetails?.percentage} %</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="col-md-12 mb-2">
                                                    <div className="account-item">
                                              <span
                                                  className="fs-6 text--gray me-2">Le prix unitaire:</span>
                                                        <span className="fs-6">{typeFeeDetails?.unit_price} TND</span>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            typeFeeDetails?.refund_type === 'percentage' ? (
                                                <div className="col-md-12 mb-2">
                                                    <div className="account-item">
                                                        <span className="fs-6 text--gray me-2">Le montant dépensé:</span>
                                                        <span className="fs-6">{amountSpent} TND</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>

                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Le nombre des unités:</span>
                                                            <span className="fs-6">{quantity}</span>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Le tolal:</span>
                                                            <span
                                                                className="fs-6">{quantity * typeFeeDetails?.unit_price} TND</span>
                                                        </div>
                                                    </div>

                                                </>
                                            )
                                        }
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">La date de dépense:</span>
                                                <span className="fs-6">{moment(expenseDate).format('YYYY-MM-DD')}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <span className="fs-6 text--gray me-2">Le plafond du frais:</span>
                                                {
                                                typeFeeDetails?.ceiling_type === "none" && (
                                                        <span className="text-danger">----</span>
                                                    )
                                                }
                                                {
                                                    typeFeeDetails?.ceiling_type === "per_day" && (
                                                        <span className="text-danger">{typeFeeDetails?.ceiling} TND / Jour</span>
                                                    )
                                                }
                                                {
                                                    typeFeeDetails?.ceiling_type === "per_year" && (
                                                        <span className="text-danger">{typeFeeDetails?.ceiling} TND / Année</span>
                                                    )
                                                }
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div className="head border-bottom pb-4 mb-4">
                                    <h1 className="light fs-5 title text-secondary mb-3">
                                        Les documents justificatifs
                                    </h1>
                                    <div className="document-content d-flex gap-2 align-items-center">
                                        {fileList.map((document:any) => (
                                            <div key={document.id} className="mb-2">
                                                <a href="#"
                                                   onClick={() => openDocumentModal(document)}>
                                                    <img width={80} src={assets.pdfIcon} alt="pdf"/>
                                                </a>
                                            </div>
                                        ))}
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
                    {/* ------------- display refund details ------------- */}
                    {
                        selectedRefund && (
                            <RefundDetailsModal
                                selectedRefund={selectedRefund}
                                handleCancel={handleCancel}
                                isModalOpen={isModalOpen}
                            />
                        )
                    }

                </div>
            </div>
        </>
    )
};

export default RefundDemand;