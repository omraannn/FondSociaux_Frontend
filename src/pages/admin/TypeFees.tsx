import {Table, Button, Modal, Select, InputNumber} from 'antd';
import { IoMdAdd } from 'react-icons/io';
import {useEffect, useState} from 'react';
import {CustomFilterDropdown, CustomInput, ManagementFormModal} from '../../components/index';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {ExclamationCircleFilled, SearchOutlined} from "@ant-design/icons";
import {openNotificationWithIcon} from "../../utils/notificationUtils";
import categoryService from "../../services/categoryService";
import typeFeesService from "../../services/typeFeesService";
import {handleError} from "../../utils/handleErrors";
import moment from "moment";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";
import userService from "../../services/userService";

const TypeFees = () => {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { confirm } = Modal;


    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Selectionner une categorie');
    const [percentage, setPercentage] = useState("");
    const [ceiling, setCeiling] = useState("");
    const [ceilingType, setCeilingType] = useState('none');
    const [description, setDescription] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [refundType, setRefundType] = useState('percentage');


    const [typeFees, setTypeFees] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentTypeFee, setCurrentTypeFee] = useState(null);
    const [errors, setErrors] = useState<any>({});


    const [userPermissions, setUserPermissions] = useState<any>([]);
    const [filteredTitle, setFilteredTitle] = useState<string | null>(null);
    const [filteredCategory, setFilteredCategory] = useState<number | null>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });



    const { handlePermissionErrors } = useHandlePermissionErrors();


    const fetchUserPermissions = async () => {
        const permissions = await userService.getUserPermissions();
        console.log(permissions)
        setUserPermissions(permissions);
    };


    useEffect(() => {
        fetchTypeFees(pagination.current, pagination.pageSize, { title: filteredTitle, category_id: filteredCategory });
        fetchUserPermissions();
        fetchCategoriesAll();
    }, [pagination.current, pagination.pageSize, filteredTitle, filteredCategory]);

    const handleTableChange = (pagination:any, filters:any) => {
        const newFilters = {
            title: filters.title ? filters.title[0] : null,
            category_id: filters.category ? filters.category[0] : null,
        };

        setFilteredTitle(newFilters.title);
        setFilteredCategory(newFilters.category_id ? parseInt(newFilters.category_id, 10) : null);
        fetchTypeFees(pagination.current, pagination.pageSize, newFilters);
    };

    /*|--------------------------------------------------------------------------
    |  Fetch type fees
    |-------------------------------------------------------------------------- */
    const fetchTypeFees = async (page = 1, pageSize = 10, filters = {}) => {
        try {
            setIsLoading(true);
            const response = await typeFeesService.getTypeFees(page, pageSize, filters);
            setTypeFees(response.typeFees.reverse());
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.pagination.total,
            });
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching typeFees:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des types de frais');
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Fetch categories
    |-------------------------------------------------------------------------- */
    const fetchCategoriesAll = async () => {
        try {
            const response = await categoryService.getCategoriesAll();
            const categoryOptions = response.categories.map((category:any) => ({
                key: category.id,
                value: category.id,
                label: category.title
            }));
            setCategories(categoryOptions);
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching categories:', error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors du chargement des catégories');
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle columns table
    |-------------------------------------------------------------------------- */
    const columns:any = [
        {
            title: 'Catégorie',
            dataIndex: 'category',
            key: 'category',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
                const selectedCategory:any = categories.find((cat:any) => cat.id === selectedKeys[0]);
                return(
                <div style={{ padding: 8 }}>
                    <Select
                        showSearch
                        placeholder="Sélectionner une catégorie"
                        options={categories}
                        onChange={value => {
                            setSelectedKeys(value ? [value.toString()] : []);
                            confirm();
                        }}
                        value={selectedCategory ? selectedCategory.title : undefined}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                        filterOption={(input: any, option: any) =>
                            option?.label.toLowerCase().includes(input.toLowerCase())
                        }
                    />
                    <Button
                        type="dashed"
                        onClick={() => {
                            confirm();
                        }}
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Filtrer
                    </Button>
                    <Button onClick={() => {
                        handleCategoryFilter(null);
                        setSelectedKeys([]);
                        clearFilters();
                    }} size="small" style={{ width: 90 }}>
                        Réinitialiser
                    </Button>
                </div>
            )},
            onFilter: (value: any, record: any) => record.category?.id === parseInt(value, 10),
            filteredValue: filteredCategory ? [filteredCategory.toString()] : null,
            render: (text: any, record: any) => record.category ? record.category.title : '',
        },
        {
            title: 'Titre',
            dataIndex: 'title',
            key: 'title',
            filterDropdown: (props: any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher nom"
                    handleFilter={handleTitleFilter}
                />
            ),
            onFilter: (value: any, record: any) => record.title.toLowerCase().includes(filteredTitle?.toLowerCase() || ''),
            filterIcon: (filtered: any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredTitle ? [filteredTitle] : null,
        },
        {
            title: 'Documents demandés',
            dataIndex: 'description',
            key: 'description',
            render: (text:any) => (
                <span className="d-flex justify-content-center">
                    <Button type="link" onClick={() => showDetailModal(text)}>
                        Afficher
                    </Button>
                </span>
            ),
        },
        {
            title: 'Prix Unitaire',
            dataIndex: 'unit_price',
            key: 'unit_price',
            render: (text:any) => text ? `${text} TND` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.unit_price - b.unit_price,
        },
        {
            title: 'Pourcentage',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (text:any) => text ? `${text} %` : <span className='text-danger'>----</span>,
            sorter: (a:any, b:any) => a.percentage - b.percentage,
        },
        {
            title: 'Plafond en TND',
            dataIndex: 'ceiling',
            key: 'ceiling',
            render: (text:any, record:any) => {
                if (record.ceiling_type === 'none') {
                    return '----';
                } else if (record.ceiling_type === 'per_day') {
                    return text ? `${text} / jour` : '----';
                } else if (record.ceiling_type === 'per_year') {
                    return text ? `${text} / année` : '----';
                }
                return '----';
            },
            sorter: (a:any, b:any) => a.ceiling - b.ceiling,
        },
        {
            title: "Date d'ajout",
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a:any, b:any) => moment(a.created_at).unix() - moment(b.created_at).unix(),
            render: (text:any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: "Dèrniere modification",
            dataIndex: 'updated_at',
            key: 'updated_at',
            sorter: (a:any, b:any) => moment(a.updated_at).unix() - moment(b.updated_at).unix(),
            render: (text:any) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (text:any, record:any) => (
                <div className="d-flex justify-content-end">
                    {
                        userPermissions.length > 0 && userPermissions.includes('mettre à jour un type de frais') && (
                            <Button size="small" onClick={() => handleEdit(record)}>
                                Modifier
                            </Button>
                        )
                    }
                    {
                        userPermissions.length > 0 && userPermissions.includes('supprimer un type de frais') && (
                            <Button type="text" size="small" onClick={() => showDeleteConfirm(record.id)} style={{ marginLeft: 8 }}>
                                Supprimer
                            </Button>
                        )
                    }
                </div>
            ),
        },
    ];


    /*|--------------------------------------------------------------------------
    |  Fetch modal visibility
    |-------------------------------------------------------------------------- */
    const showAddModal = () => setIsAddModalOpen(true);
    const showEditModal = () => setIsEditModalOpen(true);
    const showDetailModal = (description:any) => {
        setDescription(description);
        setIsDetailModalOpen(true);
    };
    const handleCancel = () => resetStates();


    /*|--------------------------------------------------------------------------
    |  Handle filter functionality
    |-------------------------------------------------------------------------- */
    const handleTitleFilter = (value: any) => {
        resetPagination();
        setFilteredTitle(value);
        fetchTypeFees(1, pagination.pageSize, { title: value, category_id: filteredCategory });
    };

    const handleCategoryFilter = (value: any) => {
        resetPagination();
        setFilteredCategory(value);
        fetchTypeFees(1, pagination.pageSize, { title: filteredTitle, category_id: value });
    };

    const resetPagination = () => {
        setPagination(prev => ({
            ...prev,
            current: 1,
        }));
    };

    /*|--------------------------------------------------------------------------
    |  Handle action changes
    |-------------------------------------------------------------------------- */
    const handleTitle = (e:any) => setTitle(e.target.value)
    const handleDesc = (value:any) => setDescription(value)
    const handleCategory = (value:any) => setCategory(value)
    const handleCeiling = (value:any) => setCeiling(value)
    const handlePercentage = (value:any) =>  setPercentage(value)
    const handleUnitPrice = (value:any) => setUnitPrice(value); // Handle unit price state
    const handleRefundType = (value:any) => {
        setRefundType(value)
        setPercentage('')
        setUnitPrice('')
    }
    const handleCeilingType = (value:any) => {
        setCeilingType(value)
        setCeiling("")
    }


    /*|--------------------------------------------------------------------------
   |  Handle add type fee
   |-------------------------------------------------------------------------- */
    const handleAddTypeFee = async () => {
        try {
            console.log(title, description, category, percentage, unitPrice, refundType, ceiling )
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category_id', category);
            formData.append('percentage', percentage);
            formData.append('ceiling', ceiling);
            formData.append('ceiling_type', ceilingType);
            formData.append('unit_price', unitPrice);
            formData.append('refund_type', refundType);
            await typeFeesService.createTypeFee(formData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Type de frais ajoutée avec succès');
            await fetchTypeFees();
        } catch (error) {
            await handlePermissionErrors(error);
            console.log(error)
            handleError(error, setErrors);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle update Type Fee
    |-------------------------------------------------------------------------- */
    const handleEdit = (record:any) => {
        setTitle(record.title);
        setCategory(record.category_id);
        setCeiling(record.ceiling);
        setCeilingType(record.ceiling_type)
        setPercentage(record.percentage);
        setDescription(record.description);
        setUnitPrice(record.unit_price);
        setRefundType(record.refund_type);
        setCurrentTypeFee(record.id);
        showEditModal();
    };
    const handleUpdateTypeFee = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category_id', category);
            formData.append('percentage', percentage);
            formData.append('ceiling', ceiling);
            formData.append('unit_price', unitPrice);
            formData.append('refund_type', refundType);
            formData.append('ceiling_type', ceilingType);
            await typeFeesService.updateTypeFee(currentTypeFee, formData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Type de Frais mise à jour avec succès');
            await fetchTypeFees();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


   /*|--------------------------------------------------------------------------
   |  Handle delete Type Fee
   |-------------------------------------------------------------------------- */
    const showDeleteConfirm = (key:any) => {
        confirm({
            title: 'Êtes-vous sûr de supprimer ce type de frais?',
            icon: <ExclamationCircleFilled />,
            content: '',
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                handleDelete(key);
            },
            onCancel() {
                console.log('Annuler');
            },
        });
    };
    const handleDelete = async (key:any) => {
        try {
            await typeFeesService.deleteTypeFee(key);
            openNotificationWithIcon('success', 'Succès', 'Type de frais supprimée avec succès');
            await fetchTypeFees();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors de la suppression du type de frais');
        }
    };


    /*|--------------------------------------------------------------------------
    |  Reset States
    |-------------------------------------------------------------------------- */
    const resetStates = () => {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDetailModalOpen(false);
        setTitle('');
        setDescription('');
        setCategory('Selectionner une categorie');
        setPercentage('');
        setCeiling('');
        setUnitPrice('');
        setRefundType('percentage');
        setCeilingType('none')
        setErrors({})
        setCurrentTypeFee(null);
    }



    /*|--------------------------------------------------------------------------|
    |                                 Start JSX                                  |
    |----------------------------------------------------------------------------|*/
    return (
        <>
            <div>
                <h3 className="mb-4 bg-white p-4">Les types de frais</h3>
                <div>
                    <div className="mb-2 d-flex justify-content-end">
                        {
                            userPermissions.length > 0 && userPermissions.includes('créer un type de frais') && (
                                <button className="btn bg-dark text-white" onClick={showAddModal}>
                                    <IoMdAdd className="fs-4"/> Ajouter un type de frais
                                </button>
                            )
                        }
                    </div>
                    <Table
                        rowKey="id"
                        loading={isLoading}
                        columns={columns}
                        dataSource={typeFees}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                    />
                </div>
            </div>

            {/* ------- Documents needed of this type Fee ------- */}
            <Modal
                title="Documents demandés"
                open={isDetailModalOpen}
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Fermer
                    </Button>,
                ]}
            >
                <h3>{title}</h3>
                <div dangerouslySetInnerHTML={{ __html: description }} />
            </Modal>


            {/* ------- Add type of Fee ------- */}
            <ManagementFormModal
                title="Ajouter un type de frais"
                subTitle="Types de frais"
                open={isAddModalOpen}
                onClose={handleCancel}
                onSubmit={handleAddTypeFee}
            >
                <CustomInput I_class_container="mb-3" type="text" label="Entrer le titre du type de frais"
                             action={handleTitle} value={title} error={errors.title}/>
                <div className="mb-2">
                    <Select
                        className="w-100 mb-1 bg-white"
                        showSearch
                        placeholder="Selectionner une categorie"
                        filterOption={(input:any, option:any) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={categories}
                        onChange={handleCategory}
                        value={category}
                    />
                    {errors.category_id && <div className="p-1 text-danger">{errors.category_id}</div>}
                </div>

                <div className="row align-items-center mb-1">
                    <div className="col-md-6 mb-2">
                        {refundType === 'per_unit' ? (
                            <>
                                <InputNumber
                                    min={0}
                                    value={unitPrice}
                                    placeholder="Prix unitaire en TND"
                                    onChange={handleUnitPrice}
                                    style={{width: '100%'}}
                                />
                            </>
                        ) : (
                            <>
                                <InputNumber
                                    min={0}
                                    max={100}
                                    placeholder="Poucentage %"
                                    value={percentage}
                                    onChange={handlePercentage}
                                    style={{width: '100%'}}
                                />
                            </>
                        )}
                    </div>

                    <div className="col-md-6 mb-2">
                        <Select
                            value={refundType}
                            onChange={handleRefundType}
                            style={{width: '100%'}}
                            options={[
                                {value: 'percentage', label: '%'},
                                {value: 'per_unit', label: 'TND'},
                            ]}
                        />
                    </div>

                    {errors.unit_price && <div className="text-danger pb-2">{errors.unit_price}</div>}
                    {errors.percentage && <div className="text-danger pb-2">{errors.percentage}</div>}

                </div>

                <div className="row align-items-center mb-1">
                    <div className="col-md-6">
                        <Select
                            className="mb-1"
                            style={{width: '100%', marginTop:'-15px'}}
                            value={ceilingType}
                            onChange={handleCeilingType}
                            options={[
                                { value: 'none', label: 'Aucun plafond' },
                                { value: 'per_year', label: 'Par année' },
                                { value: 'per_day', label: 'Par jour' }
                            ]}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        {
                            ceilingType === 'none' ? (
                                <>
                                  <div></div>
                                </>
                            ) : (
                                <InputNumber
                                    min={0}
                                    placeholder="Entrer le plafond en TND"
                                    value={ceiling}
                                    onChange={handleCeiling}
                                    style={{width: '100%'}}
                                />
                            )
                        }
                    </div>

                    {errors.ceiling && <div className="text-danger pb-2">{errors.ceiling}</div>}
                    {errors.ceiling_type && <div className="text-danger pb-2">{errors.ceiling_type}</div>}
                </div>

                <ReactQuill
                    className="bg-white"
                    theme="snow"
                    value={description}
                    placeholder="Entrez les documents demandés..."
                    onChange={handleDesc}
                />
                {errors.description && <div className="text-danger pb-2">{errors.description}</div>}

            </ManagementFormModal>


            {/* ------- Update type of Fee ------- */}
            <ManagementFormModal
                title="Modifier un type de frais"
                subTitle="Types de frais"
                open={isEditModalOpen}
                onClose={handleCancel}
                onSubmit={handleUpdateTypeFee}
            >
                <CustomInput I_class_container="mb-3" type="text" label="Entrer le titre du type de frais"
                             action={handleTitle} value={title} error={errors.title}/>
                <div className="mb-2">
                    <Select
                        className="w-100 mb-1 bg-white"
                        showSearch
                        placeholder="Selectionner une categorie"
                        filterOption={(input:any, option:any) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={categories}
                        onChange={handleCategory}
                        value={category}
                    />
                    {errors.category_id && <div className="p-1 text-danger">{errors.category_id}</div>}
                </div>

                <div className="row align-items-center mb-1">
                    <div className="col-md-6 mb-2">
                        {refundType === 'per_unit' ? (
                            <>
                                <InputNumber
                                    min={0}
                                    value={unitPrice}
                                    placeholder="Prix unitaire en TND"
                                    onChange={handleUnitPrice}
                                    style={{width: '100%'}}
                                />
                                {errors.unit_price && <div className="text-danger">{errors.unit_price}</div>}
                            </>
                        ) : (
                            <>
                                <InputNumber
                                    min={0}
                                    max={100}
                                    placeholder="Poucentage %"
                                    value={percentage}
                                    onChange={handlePercentage}
                                    style={{width: '100%'}}
                                />
                                {errors.percentage && <div className="text-danger">{errors.percentage}</div>}
                            </>
                        )}
                    </div>
                    <div className="col-md-6 mb-2">
                        <Select
                            value={refundType}
                            onChange={handleRefundType}
                            style={{width: '100%'}}
                            options={[
                                {value: 'percentage', label: '%'},
                                {value: 'per_unit', label: 'TND'},
                            ]}
                        />
                    </div>
                </div>


                <div className="row align-items-center mb-1">
                    <div className="col-md-6">
                        <Select
                            value={ceilingType}
                            onChange={handleCeilingType}
                            style={{width: '100%'}}
                            options={[
                                {value: 'none', label: 'Aucun plafond'},
                                {value: 'per_year', label: 'Par année'},
                                {value: 'per_day', label: 'Par jour'}
                            ]}
                        />
                    </div>
                    <div className="col-md-6 mb-2">
                        {
                            ceilingType === 'none' ? (
                                <>
                                    <div></div>
                                </>
                            ) : (
                                <InputNumber
                                    className="mt-2"
                                    min={0}
                                    placeholder="Entrer le plafond en TND"
                                    value={ceiling}
                                    onChange={handleCeiling}
                                    style={{width: '100%'}}
                                />
                            )
                        }
                    </div>
                </div>

                <ReactQuill
                    className="bg-white"
                    theme="snow"
                    value={description}
                    placeholder="Entrez les documents demandés..."
                    onChange={handleDesc}
                />
            </ManagementFormModal>
        </>
    );
};

export default TypeFees;