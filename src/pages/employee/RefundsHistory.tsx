import { openNotificationWithIcon } from "../../utils/notificationUtils";
import { useEffect, useState } from "react";
import refundService from "../../services/refundService";
import {CustomInput, LoadingSpinner, ManagementFormModal} from "../../components/index";
import {Button, DatePicker, Form, Modal, notification, Popconfirm, Select, Table, Tag, Upload} from "antd";
import {FilePdfOutlined, UploadOutlined} from "@ant-design/icons";
import typeFeesService from "../../services/typeFeesService";
import moment from "moment";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";
import {handleError} from "../../utils/handleErrors";

const { Option } = Select;

const RefundsHistory = () => {

    const [isLoading, setIsLoading] = useState(true);


    const [isCommentRHModalOpen, setIsCommentRHModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [showedTopNotification, setShowedTopNotification] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isTypeFeeModalOpen, setIsTypeFeeModalOpen] = useState(false);

    const [currentRefund, setCurrentRefund] = useState<any>(null);
    const [selectedTypeFee, setSelectedTypeFee] = useState<any>(null);

    const [commentRH, setCommentRH] = useState('');
    const [documentUrl, setDocumentUrl] = useState('')


    const [refunds, setRefunds] = useState([]);
    const [typeFees, setTypeFees] = useState([]);


    const [filteredTypeFee, setFilteredTypeFee] = useState<any>(null);
    const [filteredStatus, setFilteredStatus] = useState<any>(null);


    const [subject, setSubject] = useState('');
    const [explanation, setExplanation] = useState('');
    const [amountSpent, setAmountSpent] = useState('')
    const [expenseDate, setExpenseDate] = useState<any>(null);
    const[quantity, setQuantity] = useState('');
    const [typeFee, setTypeFee] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [fileList, setFileList] = useState([]);


    const { handlePermissionErrors } = useHandlePermissionErrors();

    useEffect(() => {
        fetchRefunds();
        fetchTypeFeesAll()
        if (!showedTopNotification) {
            showTopNotification();
            setShowedTopNotification(true);
        }
    }, []);


    /*|--------------------------------------------------------------------------
    |  Fetch Type Fees for filter functionality
    |-------------------------------------------------------------------------- */
    const fetchTypeFeesAll = async () => {
        try {
            setIsLoading(true);
            const response = await typeFeesService.getTypeFeesAll();
            console.log(response.typeFees)
            setTypeFees(response.typeFees.reverse());
        } catch (error) {
            handlePermissionErrors(error);
            console.error('Error fetching typeFees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des types de frais');
        } finally {
            setIsLoading(false);
        }
    };


   /*|--------------------------------------------------------------------------
   |  Fetch auth user refunds
   |-------------------------------------------------------------------------- */
    const fetchRefunds = async () => {
        try {
            setIsLoading(true);
            const response = await refundService.getAuthRefunds();

            setRefunds(response.refunds);
        } catch (error) {
            handlePermissionErrors(error);
            console.error('Error fetching refunds:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des demandes de remboursements');
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
      |  update refund
      |-------------------------------------------------------------------------- */
    const handleUpdateRefund = async () => {
        try {
            const formData = new FormData();

            formData.append('amount_spent', amountSpent ? parseFloat(amountSpent).toString() : '');
            formData.append('expense_date',  expenseDate? expenseDate.format('YYYY-MM-DD'): null);
            formData.append('quantity', quantity ? parseFloat(quantity).toString() : '');
            formData.append('subject', subject);
            formData.append('message', explanation);
            formData.append('type_fee_id', typeFee);
            fileList.forEach((file:any) => {
                if (file.originFileObj) {
                    formData.append('supporting_documents[]', file.originFileObj);
                }
            });

            const uploadedDocumentIds = fileList.map((file:any) => file.uid);
            formData.append('uploaded_document_ids', JSON.stringify(uploadedDocumentIds));
            if(!currentRefund) {
                openNotificationWithIcon('error', 'Erreur', "Erreur lors de la mise à jour de la demande de remboursement");
                return;
            }
            const response = await refundService.updateRefund(currentRefund.id, formData);
            console.log(response)
            if (response.status === 'success') {
                await fetchRefunds();
                setIsUpdateModalOpen(false);
                openNotificationWithIcon('success', 'Succès', 'La demande de remboursement a été mise à jour avec succès');
            }
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors)
        }
    };



    /*|--------------------------------------------------------------------------
    |  Cancel pending refund demand by employee
    |-------------------------------------------------------------------------- */
    const handleCancelRefund = async (id:any) => {
        try {
            const response = await refundService.cancelRefundDemand(id);
            console.log(response)
            if(response.status === 'success'){
                await fetchRefunds()
                openNotificationWithIcon('success', 'Succés', "La demande est annulée avec Succés");
            }
        } catch (error) {
            handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', "Erreur lors de l'annulation de la demande");
        }
    }


    /*|--------------------------------------------------------------------------
    |  Fetch modal visibility
    |-------------------------------------------------------------------------- */
    const showUpdateModal = (refund:any) => {
        setCurrentRefund(refund);
        setSubject(refund.subject);
        setExplanation(refund.message);
        setAmountSpent(refund.amount_spent);
        setQuantity(refund.quantity);
        setExpenseDate(refund.expense_date ? moment(refund.expense_date) : null);
        setTypeFee(refund.type_fee_id);
        console.log(refund)
        const preparedFiles = refund.refund_documents.map((doc:any, index:any) => ({
            uid: doc.id,
            name: "document "+(index + 1),
            refund_id: doc.refund_id,
            document_path: doc.document_path,
        }));
        console.log(preparedFiles)
        setFileList(preparedFiles);
        setIsUpdateModalOpen(true);
    };

    const showCommentRHModal = (comment:string) => {
        setCommentRH(comment);
        setIsCommentRHModalOpen(true);
    };
    const showDocumentModal = (url:string) => {
        setDocumentUrl(url);
        setIsDocumentModalOpen(true);
    };
    const showTopNotification = () => {
        notification.warning({
            message: 'Message',
            description: (
                <span>Vous avez atteint le plafond dans les lignes colorées en jaune</span>
            ),
            placement: 'top',
        });
    };
    const showTypeFeeModal = (typeFee:any) => {
        setSelectedTypeFee(typeFee);
        setIsTypeFeeModalOpen(true);
    };

    const handleAddFiles = ({ fileList }:any) => {
        setFileList(fileList);
    };

    const handleRemoveFile = (file:any) => {
        setFileList((prevFileList) => prevFileList.filter((item:any) => item.uid !== file.uid));
        console.log(fileList)
    };

    const handleTypeFeeChange = (value:any) => {
        setAmountSpent("")
        setQuantity("")
        setTypeFee(value)
    }

    const handleCancel = () => {
        setIsCommentRHModalOpen(false);
        setIsDocumentModalOpen(false);
        setIsUpdateModalOpen(false)
        setCurrentRefund(null)
        setSelectedTypeFee(null)
        setIsTypeFeeModalOpen(false)
    };


    const status = [
        { id: 1, value: "accepted", label: "Accepté" },
        { id: 2, value: "rejected", label: "Rejèté" },
        { id: 3, value: "pending", label: "En attente" },
        { id: 4, value: "ceiling_reached", label: "Plafond Atteint" },
    ];

    const getStatusLabel = (statusValue:any) => {
        const statusItem = status.find(item => item.value === statusValue);
        return statusItem ? statusItem.label.toUpperCase() : statusValue.toUpperCase();
    };

    const columns = [
        {
            title: 'Type de frais',
            dataIndex: ['type_fee', 'title'],
            key: 'type_fee_title',
            render: (text:any, record:any) => (
                <Button type="link" onClick={() => showTypeFeeModal(record.type_fee)}>
                    {text}
                </Button>
            ),
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner un type de frais"
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handleTypeFeeFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    >
                        {typeFees.map((option:any) => (
                            <Select.Option key={option.id} value={option.title}>
                                {option.title}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="dashed"
                        onClick={() => {
                            handleTypeFeeFilter(selectedKeys[0]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handleTypeFeeFilter(null);
                            clearFilters?.();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => record.type_fee.title.toLowerCase().includes(value.toLowerCase()),
            filteredValue: filteredTypeFee ? [filteredTypeFee.toString()] : null,
        },
        {
            title: 'Quantité',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text:any) => text ? `${text}` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.quantity.localeCompare(b.quantity),
        },
        {
            title: 'Prix unitaire',
            dataIndex: ['type_fee', 'unit_price'],
            key: 'type_fee_title',
            render: (text:any) => text ? `${text} TND` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.unit_price.localeCompare(b.unit_price),
        },
        {
            title: 'Montant dépensé',
            dataIndex: 'amount_spent',
            key: 'amount_spent',
            render: (text:any) => text ? `${text} TND` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.amount_spent.localeCompare(b.amount_spent),
        },
        {
            title: '% de remboursement',
            dataIndex: 'type_fee',
            key: 'type_fee_percentage',
            render: (text:any) => text.percentage ? `${text.percentage} %` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.type_fee.percentage - b.type_fee.percentage,
        },
        {
            title: 'Plafond en TND',
            dataIndex: ['type_fee', 'ceiling'],
            key: 'type_fee_ceiling',
            render: (text:any, record:any) => {
                if (record.type_fee.ceiling_type === 'none') {
                    return '----';
                } else if (record.type_fee.ceiling_type === 'per_day') {
                    return text ? `${text} / jour` : '----';
                } else if (record.type_fee.ceiling_type === 'per_year') {
                    return text ? `${text} / année` : '----';
                }
                return '----';
            },
            sorter: (a:any, b:any) => a.type_fee.ceiling.localeCompare(b.type_fee.ceiling),
        },
        {
            title: 'Montant RM',
            dataIndex: 'reimbursement_amount',
            key: 'reimbursement_amount',
            render: (text:any) => `${text} TND`,
            sorter: (a:any, b:any) => a.reimbursement_amount.localeCompare(b.reimbursement_amount),
        },
        {
            title: 'Date de dépense',
            dataIndex: 'expense_date',
            key: 'expense_date',
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            render: (status:any, record:any) => {
                let color;
                switch (status) {
                    case 'accepted':
                        color = 'green';
                        break;
                    case 'rejected':
                        color = 'red';
                        break;
                    case 'pending':
                        color = 'blue';
                        break;
                    default:
                        color = 'blue';
                }

                return (
                    <div className="d-flex flex-column align-items-center gap-2">
                        <Tag color={color}>{getStatusLabel(status)}</Tag>
                        {record.ceiling_reached === 1 ? (<Tag color="orange">PLAFOND ATTEINT</Tag>) : ""}
                    </div>
                );
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }:any) => (
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner un statut"
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            handleStatusFilter(value);
                            confirm();
                        }}
                        value={selectedKeys[0]}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    >
                        {status.map(option => (
                            <Select.Option key={option.id} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                    <Button
                        type="dashed"
                        onClick={() => {
                            handleStatusFilter(selectedKeys[0]);
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button
                        onClick={() => {
                            handleStatusFilter(null);
                            clearFilters();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Réinitialiser
                    </Button>
                </div>
            ),
            onFilter: (value:any, record:any) => {
                if (value === "ceiling_reached") {
                    return record.ceiling_reached === 1;
                }
                return record.status.toLowerCase().includes(value.toLowerCase());
            },
            filteredValue: filteredStatus ? [filteredStatus.toString()] : null,
        },
        {
            title: 'Commentaire RH',
            dataIndex: 'HR_comment',
            key: 'HR_comment',
            render: (text:any) => (
                text ? (
                    <span>
                        <Button type="link" onClick={() => showCommentRHModal(text)}>
                            Afficher le commentaire
                        </Button>
                    </span>
                ) : null
            ),
        },
        {
            title: 'Documents',
            dataIndex: 'refund_documents',
            key: 'refund_documents',
            render: (refundDocuments:any) => (
                refundDocuments && refundDocuments.length > 0 ? (
                    <span>
                        {refundDocuments.map((document:any, index:any) => (
                            <Button
                                key={index}
                                type="link"
                                icon={<FilePdfOutlined />}
                                onClick={() => showDocumentModal(document.document_path)}
                            >
                                Document {index + 1}
                            </Button>
                        ))}
                    </span>
                ) : null
            ),
        },
        {
            title: 'Actions',
            dataIndex: 'id',
            key: 'actions',
            render: (id:any, record:any) => {
                if (record.status === 'pending') {
                    return (
                      <>
                          <Button type="link" onClick={() => showUpdateModal(record)}>Modifier</Button>
                          <Popconfirm
                              title="Êtes-vous sûr de vouloir annuler cette demande de remboursement?"
                              onConfirm={() => handleCancelRefund(id)}
                              okText="Oui"
                              cancelText="Non"
                          >
                              <Button type="link" className="text-danger">Annuler</Button>
                          </Popconfirm>
                      </>
                    );
                } else {
                    return <span className="p-3 text-success">Traitée</span>;
                }
            },
        },
    ];


    /*|--------------------------------------------------------------------------
    |  Handle filter functionality
    |-------------------------------------------------------------------------- */
    const handleTypeFeeFilter = (value:any) => setFilteredTypeFee(value)
    const handleStatusFilter = (value:any) => setFilteredStatus(value);

    const rowClassName = (record:any) => {
        return record.ceiling_reached ? 'red-row' : '';
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div className="refund-demand-wrapper me-3" style={{ width: '100%' }}>
                <h3 className="mb-4 fs-4 bg-white p-4 w-100">Historique des remboursements</h3>
                <div className="refund-history-content">
                    <Table
                        rowKey="id"
                        loading={isLoading}
                        columns={columns}
                        dataSource={refunds}
                        rowClassName={rowClassName}
                        scroll={{ x: 'max-content' }}
                    />
                </div>

                {/* ------- RH comment Modal ------- */}
                <Modal
                    title="Commentaire admin RH"
                    open={isCommentRHModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    <p>{commentRH}</p>
                </Modal>

                {/* ------- Documents Modal ------- */}
                <Modal
                    title="Document"
                    open={isDocumentModalOpen}
                    onCancel={handleCancel}
                    footer={[
                        <Button className="login-btn" key="cancel" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    <iframe src={`http://localhost:8000/storage/documents/${documentUrl}`} width="100%" height="500px" />
                </Modal>

                {/* ------- Fee type details Modal ------- */}
                {
                    selectedTypeFee && (
                        <Modal
                            open={isTypeFeeModalOpen}
                            onCancel={handleCancel}
                            footer={null}
                        >
                            <div className="content">
                                <div className="receipt">
                                    <div className="head border-bottom pb-2 mb-4">
                                        <h1 className="fs-4 text-secondary mb-4 mt-4">
                                            Les informations du type de frais
                                        </h1>
                                        <div className="row">
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Titre:</span>
                                                    <span
                                                        className="fs-6">{selectedTypeFee.title}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-12 mb-2">
                                                <div className="account-item">
                                                    <span className="fs-6 text--gray me-2">Plafond:</span>
                                                    {
                                                        selectedTypeFee.ceiling_type === 'none' && (
                                                            <span className="fs-6 text-danger">aucun plafond pour ce type</span>
                                                        )
                                                    }
                                                    {
                                                        selectedTypeFee.ceiling_type === 'per_year' && (
                                                            <span className="fs-6 text-danger">{selectedTypeFee.ceiling} TND/Année</span>
                                                        )
                                                    }
                                                    {
                                                        selectedTypeFee.ceiling_type === 'per_day' && (
                                                            <span className="fs-6 text-danger">{selectedTypeFee.ceiling} TND/Jour</span>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            {
                                                selectedTypeFee.refund_type === 'percentage' ? (
                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Pourcentage :</span>
                                                            <span className="fs-6">{selectedTypeFee.percentage} %</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="col-md-12 mb-2">
                                                        <div className="account-item">
                                                            <span className="fs-6 text--gray me-2">Prix unitaire :</span>
                                                            <span className="fs-6">{selectedTypeFee.unit_price} TND</span>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <div className="head pb-2 mb-3">
                                        <div className="col-md-12 mb-2">
                                            <div className="account-item">
                                                <div dangerouslySetInnerHTML={{__html: selectedTypeFee.description}}/>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Modal>
                    )
                }

                {/* ------- update refund Modal ------- */}
                <ManagementFormModal
                    title="Modifier votre demande"
                    subTitle="Demande de remboursement"
                    open={isUpdateModalOpen}
                    onClose={handleCancel}
                    onSubmit={handleUpdateRefund}
                >
                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Sujet"
                        name="subject"
                        value={subject}
                        action={(e:any) => setSubject(e.target.value)}
                        error={errors.subject}
                    />

                    <CustomInput
                        I_class_container="mb-2"
                        type="text"
                        label="Explanation"
                        name="explanation"
                        value={explanation}
                        action={(e:any) => setExplanation(e.target.value)}
                        error={errors.explanation}
                    />

                    <div>
                        {typeFee !== "" && (
                            <div className="p-4 bg-white m-3">
                                <h6 className="mb-3 text-center">Informations sur le type de frais</h6>
                                {typeFees.map((fee:any) => (
                                    fee.id === typeFee && (
                                        <div key={fee.id}>
                                            <p className="mb-2"><strong>Titre :</strong> {fee.title}</p>
                                            <p className="mb-2"><strong>Plafond: </strong> {fee.ceiling} TND</p>
                                            {
                                                fee.refund_type === "percentage" ? (
                                                    <p className='mb-2'><strong>Pourcentage: </strong> {fee.percentage}%
                                                    </p>
                                                ) : (
                                                    <p className='mb-2'><strong>Prix
                                                        unitaire: </strong> {fee.unit_price} TND</p>
                                                )
                                            }
                                            <div className='mb-2'><strong>Les documents demandé:</strong>
                                                <div className="mb-5"
                                                     dangerouslySetInnerHTML={{__html: fee.description}}/>
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.typeFee ? 'error' : ''}
                        help={errors.typeFee}
                    >
                        <Select
                            value={typeFee}
                            onChange={handleTypeFeeChange}
                        >
                            {typeFees.map((fee:any) => (
                                <Option key={fee.id} value={fee.id}>
                                    {fee.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {typeFee !== "Sélectionner un type de frais" && (
                        <div>
                            {typeFees.map((fee:any) => (
                                fee.id === typeFee && (
                                    <div key={fee.id}>
                                        {fee.refund_type === "percentage" ? (
                                            <CustomInput
                                                I_class_container="mb-2"
                                                type="number"
                                                label="Montant dépensé en TND"
                                                name="amount_spent"
                                                value={amountSpent}
                                                action={(e:any) => setAmountSpent(e.target.value)}
                                                error={errors.amount_spent}
                                            />

                                        ) : (
                                            <>
                                                <CustomInput
                                                    I_class_container="mb-2"
                                                    type="number"
                                                    label="Le nombre des pièces"
                                                    name="unity_number"
                                                    value={quantity}
                                                    action={(e:any) => setQuantity(e.target.value)}
                                                    error={errors.quantity}
                                                />
                                            </>
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <Form.Item
                        className="mb-2"
                        validateStatus={errors.expenseDate ? 'error' : ''}
                        help={errors.expenseDate}
                    >
                        <DatePicker
                            value={expenseDate}
                            onChange={(date) => setExpenseDate(date)}
                            format="DD/MM/YYYY"
                            style={{width: '100%'}}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Upload
                            fileList={fileList}
                            onRemove={handleRemoveFile}
                            beforeUpload={() => false}
                            onChange={handleAddFiles}
                            multiple
                        >
                            <Button icon={<UploadOutlined/>}>Ajouter des fichiers</Button>
                        </Upload>
                    </Form.Item>
                </ManagementFormModal>
            </div>
        </>
    );
};

export default RefundsHistory;