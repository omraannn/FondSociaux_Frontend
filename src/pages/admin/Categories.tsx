import { useEffect, useState } from 'react';
import {Table, Button, Modal, Switch} from 'antd';
import { IoMdAdd } from 'react-icons/io';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {ExclamationCircleFilled, SearchOutlined} from '@ant-design/icons';
import { openNotificationWithIcon } from '../../utils/notificationUtils';
import categoryService from '../../services/categoryService';
import { handleError } from '../../utils/handleErrors';
import { CustomInput, ManagementFormModal } from '../../components/index.js';
import moment from "moment";
import {CustomFilterDropdown} from "../../components/index";
import {useHandlePermissionErrors} from "../../utils/handlePermissionErrors";
import userService from "../../services/userService";


const Categories = () => {

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { confirm } = Modal;


    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState<any>(1);


    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [errors, setErrors] = useState<any>({});


    const [userPermissions, setUserPermissions] = useState<any>([]);
    const [filteredTitle, setFilteredTitle] = useState<any>(null);


    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const { handlePermissionErrors } = useHandlePermissionErrors();


    const fetchUserPermissions = async () => {
        const permissions = await userService.getUserPermissions();
        setUserPermissions(permissions);
    };


    useEffect(() => {
        fetchCategories(pagination.current, pagination.pageSize, { title: filteredTitle });
        fetchUserPermissions();
    }, [pagination.current, pagination.pageSize, filteredTitle]);

    const handleTableChange = (pagination: any, filters: any) => {
        const newFilters = filters.title ? { title: filters.title[0] } : {};
        fetchCategories(pagination.current, pagination.pageSize, newFilters);
    };

    /*|--------------------------------------------------------------------------
    |  Fetch categories
    |-------------------------------------------------------------------------- */
    const fetchCategories = async (page = 1, pageSize = 10, filters = {}) => {
        try {
            setIsLoading(true);
            const response = await categoryService.getCategories(page, pageSize, filters);
            setCategories(response.categories.reverse());
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.pagination.total,
            });
        } catch (error) {
            await handlePermissionErrors(error);
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Table columns
    |-------------------------------------------------------------------------- */
    const columns :any = [
        {
            title: 'Titre',
            dataIndex: 'title',
            key: 'title',
            sorter: (a:any, b:any) => a.title.localeCompare(b.title),
            filterDropdown: (props:any) => (
                <CustomFilterDropdown
                    {...props}
                    placeholder="Rechercher titre"
                    handleFilter={handleTitleFilter}
                />
            ),
            onFilter: (value:any, record:any) => record.title.toLowerCase().includes(filteredTitle.toLowerCase()),
            filterIcon: (filtered:any) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            filteredValue: filteredTitle ? [filteredTitle] : null,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text:any) => (
                <span>
                    <Button type="link" onClick={() => showDetailModal(text)}>
                        Afficher la description
                    </Button>
                </span>
            ),
        },
        {
            title: 'Active',
            dataIndex: 'active',
            key: 'active',
            render: (text:any, record:any) => <Switch checked={record.active} disabled />,
        },
        {
            title: "Date d'ajout",
            dataIndex: 'created_at',
            key: 'created_at',
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
                        userPermissions.length > 0 && userPermissions.includes('mettre à jour une catégorie') && (
                            <Button size="small" onClick={() => handleEdit(record)}>
                                Modifier
                            </Button>
                        )
                    }

                    {
                        userPermissions.length > 0 && userPermissions.includes('supprimer une catégorie') && (
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
    |  Handle modal visibility
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
        fetchCategories(1, pagination.pageSize, { title: value });
    };
    const handleTitle = (e:any) => setTitle(e.target.value);
    const handleDesc = (value:any) => setDescription(value);
    const handleActive = (checked:any) => setActive(checked ? 1 : 0);

    const resetPagination = () => {
        setPagination(prev => ({
            ...prev,
            current: 1,
        }));
    };
    /*|--------------------------------------------------------------------------
    |  Handle store category
    |-------------------------------------------------------------------------- */
    const handleAddCategory = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('active', active);
            await categoryService.createCategory(formData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Catégorie ajoutée avec succès');
            await fetchCategories();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle update category
    |-------------------------------------------------------------------------- */
    const handleEdit = (record:any) => {
        setCurrentCategory(record);
        setTitle(record.title);
        setDescription(record.description);
        setActive(record.active);
        showEditModal();
    };
    const handleUpdateCategory = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('active', active);
            await categoryService.updateCategory(currentCategory.id, formData);
            resetStates();
            openNotificationWithIcon('success', 'Succès', 'Catégorie mise à jour avec succès');
            await fetchCategories();
        } catch (error) {
            await handlePermissionErrors(error);
            handleError(error, setErrors);
        }
    };


    /*|--------------------------------------------------------------------------
    |  Handle delete category
    |-------------------------------------------------------------------------- */
    const showDeleteConfirm = (key:any) => {
        confirm({
            title: 'Êtes-vous sûr de supprimer cette catégorie?',
            icon: <ExclamationCircleFilled />,
            okText: 'Supprimer',
            okType: 'danger',
            cancelText: 'Annuler',
            onOk() {
                handleDelete(key);
            },
            onCancel() {
                console.log('Annulation de la suppression');
            },
        });
    };
    const handleDelete = async (key:any) => {
        try {
            await categoryService.deleteCategory(key);
            openNotificationWithIcon('success', 'Succès', 'Catégorie supprimée avec succès');
            await fetchCategories();
        } catch (error) {
            await handlePermissionErrors(error);
            openNotificationWithIcon('error', 'Erreur', 'Erreur lors de la suppression de la catégorie');
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
        setErrors({});
        setCurrentCategory(null);
    };


    return (
        <>
            <div>
                <h3 className="mb-4 bg-white p-4 ">Categories</h3>
                <div>
                    <div className="mb-2 d-flex justify-content-end">
                        {
                            userPermissions.length > 0 && userPermissions.includes('créer une catégorie') && (
                                <button className="btn bg-dark text-white" onClick={showAddModal}>
                                    <IoMdAdd className="fs-4"/> Ajouter une catégorie
                                </button>
                            )
                        }
                    </div>
                    <Table
                        columns={columns}
                        dataSource={categories}
                        rowKey="id"
                        loading={isLoading}
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

            {/* ------- description category details ------- */}
            <Modal
                title="Détails de la catégorie"
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

            {/* ------- add category ------- */}
            <ManagementFormModal
                title="Ajouter une catégorie"
                subTitle="Catégories"
                open={isAddModalOpen}
                onClose={handleCancel}
                onSubmit={handleAddCategory}
            >
                <CustomInput
                    I_class_container="mb-3"
                    type="text"
                    label="Entrer le titre de la catégorie"
                    value={title}
                    action={handleTitle}
                    error={errors.title}
                />
                <div className="mb-3 d-flex gap-2 mx-2">
                    <h6>Active</h6>
                    <Switch checked={active} onChange={handleActive} />
                    {errors.active && <div className="p-1 text-danger">{errors.active}</div>}
                </div>
                <ReactQuill className="bg-white" theme="snow" value={description} placeholder="Entrez votre description ici..." onChange={handleDesc} />
                {errors.description && <div className="p-1 text-danger">{errors.description}</div>}

            </ManagementFormModal>

            {/* ------- update category ------- */}
            <ManagementFormModal
                title="Modifier une catégorie"
                subTitle="Catégories"
                open={isEditModalOpen}
                onClose={handleCancel}
                onSubmit={handleUpdateCategory}
            >
                <CustomInput
                    I_class_container="mb-3"
                    type="text"
                    label="Entrer le titre de la catégorie"
                    value={title}
                    action={handleTitle}
                    error={errors.title}
                />
                <div className="mb-3 d-flex gap-2 mx-2">
                    <h6>Active</h6>
                    <Switch checked={active} onChange={handleActive} />
                    {errors.active && <div className="p-1 text-danger">{errors.active}</div>}
                </div>
                <ReactQuill className="bg-white" theme="snow" value={description} placeholder="Entrez votre description ici..." onChange={handleDesc} />
                {errors.description && <div className="p-1 text-danger">{errors.description}</div>}
            </ManagementFormModal>
        </>
    );
};

export default Categories;