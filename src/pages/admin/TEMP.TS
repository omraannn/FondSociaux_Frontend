// SocialFundsCategoriesSlice.ts

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


class SocialFundsCategoriesSlice {

    /*|--------------------------------------------------------------------------
    | Fetch all
    |-------------------------------------------------------------------------- */
    async getCategoriesAll() {
        try {
            const response = await api.get('/categories/all');
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch categories");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Fetch categories
    |-------------------------------------------------------------------------- */
    async getFSCategories(current = 1, pageSize = 10,  filters = {}) {
        try {
            const response = await api.get('/social-funds/categories', {
                params: {
                    current,
                    pageSize,
                    ...filters,
                },
            });
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to fetch categories");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Store category
    |-------------------------------------------------------------------------- */
    async createCategory(categoryData:any) {
        try {
            const response = await api.post('/social-funds/categories/store-category', categoryData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to create category");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Update categories
    |-------------------------------------------------------------------------- */
    async updateCategory(id:any, categoryData:any) {
        try {
            const response = await api.post(`/social-funds/categories/update-category/${id}`, categoryData);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to update category");
            }
        }
    }


    /*|--------------------------------------------------------------------------
    | Delete categories
    |-------------------------------------------------------------------------- */
    async deleteCategory(id:any) {
        try {
            const response = await api.delete(`/social-funds/categories/delete-category/${id}`);
            return response.data;
        } catch (error:any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            } else {
                throw new Error("Failed to delete category");
            }
        }
    }
}

export default new SocialFundsCategoriesSlice();











// -------------------------------------- component 



import React, { useEffect, useRef, useState } from "react";
import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Divider,
    Drawer, Form,
    Input,
    Modal,
    Popconfirm,
    Row, Select,
    Space,
    Switch,
    DatePicker
} from "antd";
import { ProTable, TableDropdown } from "@ant-design/pro-components";
import ChEditor from "@/pages/finance/avances/demandesAvances/ChEditor";
import {DeleteOutlined, DownOutlined, EditOutlined, EyeOutlined, PlusOutlined, UpOutlined} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import socialFundsCategoriesSlice from "@/features/RessourcesHumaines/socialFunds/SocialFundsCategoriesSlice";
import {FormattedMessage} from "react-intl";
import Title from "antd/lib/typography/Title";

const { RangePicker } = DatePicker;
function SocialFundsCategories() {
    let { windowWidth } = useSelector((store: any) => store.ui);

    const [loading, setLoading] = useState(true);
    const tableRef = useRef();
    const [expanded, setExpanded] = useState(false);

    const [fsCategories, setFsCategories] = useState<any[]>([]);
    const [currentCategory, setCurrentCategory] = useState<any>(null);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [isShowDrawerOpen, setIsShowDrawerOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState<any>(1);

    const [form] = Form.useForm();
    const [filters, setFilters] = useState({
        sTitle: '',
        sDescription: '',
        sActive: null,
        startDate: null,
        endDate: null
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    /*|--------------------------------------------------------------------------
    |  Fetch categories
    |-------------------------------------------------------------------------- */
    const handleGetCategories = async (current = 1, pageSize = 10, filters = {}) => {
        try {
            setLoading(true);
            const response = await socialFundsCategoriesSlice.getFSCategories(current, pageSize, filters);
            setFsCategories(response.categories.reverse());
            setPagination({
                ...pagination,
                current,
                pageSize,
                total: response.pagination.total,
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetCategories(pagination.current, pagination.pageSize, filters);
    }, [pagination.current, pagination.pageSize, filters]);

    /*|--------------------------------------------------------------------------
    |  Handle change functionality
    |-------------------------------------------------------------------------- */
    const handleTitle = (e:any) => setTitle(e.target.value);
    const handleDesc = (value:any) => setDescription(value);
    const handleActive = (checked:any) => setActive(checked ? 1 : 0);
    const handleCancel = () => reset();

    /*|--------------------------------------------------------------------------
      |  Handle store category
      |-------------------------------------------------------------------------- */
    const handleAddCategory = async () => {
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('active', active);
            await socialFundsCategoriesSlice.createCategory(formData);
            reset();
            await handleGetCategories();
        } catch (error:any) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    /*|--------------------------------------------------------------------------
     |  Handle update category
     |-------------------------------------------------------------------------- */
    const handleEdit = (record:any) => {
        setCurrentCategory(record);
        form.setFieldsValue({
            title: record.title,
            active: record.active,
            description: record.description,
        });
        setIsEditDrawerOpen(true);
    };
    const handleUpdateCategory = async () => {
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('active', active);
            await socialFundsCategoriesSlice.updateCategory(currentCategory.id, formData);
            reset();
            await handleGetCategories();
        } catch (error) {
            console.log(error)
        }   finally {
            setLoading(false)
        }
    };

    /*|--------------------------------------------------------------------------
     |  Handle delete category
     |-------------------------------------------------------------------------- */
    const handleDelete = async (key:any) => {
        try {
            setLoading(true)
            await socialFundsCategoriesSlice.deleteCategory(key);
            await handleGetCategories();
        } catch (error) {
            console.log(error)
        }  finally {
            setLoading(false)
        }
    };
    const showDetailModal = (description:any) => {
        setDescription(description);
        setIsDetailModalOpen(true);
    };
    const reset =  () => {
        setIsAddDrawerOpen(false);
        setIsShowDrawerOpen(false)
        setIsEditDrawerOpen(false)
        setIsDetailModalOpen(false)
        setCurrentCategory(null);
        form.resetFields();
        setTitle("")
        setDescription("")
        setActive(1)
    }

    /*|--------------------------------------------------------------------------
    |  Table columns
    |-------------------------------------------------------------------------- */
    const columns :any = [
        {
            title: 'Titre',
            dataIndex: 'title',
            key: 'title',
            sorter: (a:any, b:any) => a.title.localeCompare(b.title),
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
            title: "Action",
            valueType: "option",
            key: "option",
            render: (text, record) => [
                windowWidth > 620 ? (
                    <Space size="small" key={record.id}>
                        <a
                            onClick={() => {
                                setCurrentCategory(record);
                                setIsShowDrawerOpen(true);
                            }}
                        >
                            <EyeOutlined />
                        </a>
                        <Divider type="vertical" />
                        <a
                            onClick={() => {
                                handleEdit(record)
                                setIsEditDrawerOpen(true)
                            }}
                        >
                            <EditOutlined />
                        </a>
                        <Divider type="vertical" />
                        <a>
                            <Popconfirm
                                title="voulez-vous vraiment supprimer la Categorie ?"
                                onConfirm={() => { handleDelete(record.id) }}
                                okText="Oui"
                                cancelText="Non"
                            >
                                <DeleteOutlined />
                            </Popconfirm>
                        </a>
                    </Space>
                ) : (
                    <TableDropdown
                        key=" actionGroup "
                        menus={[
                            {
                                key: "0",
                                name: "Détail",
                                onClick: () => {
                                    setCurrentCategory(record);
                                    setIsShowDrawerOpen(true);
                                },
                            },
                            {
                                key: "1",
                                name: "Modifier",
                                onClick: () => {
                                    handleEdit(record)
                                    setIsEditDrawerOpen(true)
                                },
                            },
                            {
                                key: "2",
                                name: "Supprimer",
                                onClick: () => {
                                    handleDelete(record.id)
                                },
                            },
                        ]}
                    />
                ),
            ],
        },
    ];

    const handleFilter = () => {
        const values = form.getFieldsValue();
        const { sTitle, sDescription, sActive, dateRange } = values;

        // Extract start and end dates from the date range using moment
        const startDate = dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : null;
        const endDate = dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : null;

        // Update filters with the retrieved values
        setFilters({
            sTitle,
            sDescription,
            sActive,
            startDate,
            endDate
        });
        // Force pagination to start at the first page (page 1) when filtering
        setPagination((prev) => ({
            ...prev,
            current: 1,
        }));
    };

    const handleReset = () => {
        form.resetFields();
        setFilters({
            sTitle: '',
            sDescription: '',
            sActive: null,
            startDate: null,
            endDate: null
        });
        handleGetCategories(1, 10, {});
    };
    const showExpandButton = Object.keys(filters).length > 3;
    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };
    return (
        <div>
            <Breadcrumb separator=">" className="mt-5">
                <Breadcrumb.Item href="">Dashboard</Breadcrumb.Item>
                <Breadcrumb.Item href="">Fonds sociaux</Breadcrumb.Item>
                <Breadcrumb.Item href="">Catégorie</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="mt-5" gutter={[12, 24]}>
                <Col xs={24}>
                    <Card
                        title={<Title level={4}><FormattedMessage id={"Gestion des Catégories"} /></Title>}
                        bordered={false}
                    >

                        {/*|--------------------------------------------------------------------------
                        | Filter feature
                        |-------------------------------------------------------------------------- */}
                        <Card className="mb-4 p-3" bordered={false}>
                            <Form form={form} layout="inline" style={{gap:"10px"}} initialValues={filters}>
                                <Form.Item name="sTitle" label="Titre">
                                    <Input placeholder="Rechercher par titre" />
                                </Form.Item>
                                <Form.Item name="sDescription" label="description">
                                    <Input placeholder="Rechercher par description" />
                                </Form.Item>
                                <Form.Item name="dateRange" label="Date">
                                    <RangePicker
                                        format="YYYY-MM-DD"
                                        allowClear
                                        value={
                                            filters.startDate && filters.endDate ? [
                                                moment(filters.startDate) as any,,
                                                moment(filters.endDate) as any,
                                            ] : [] as any
                                        }
                                    />
                                </Form.Item>
                                {expanded && (
                                    <Form.Item name="sActive" label="Actif">
                                        <Select placeholder="Sélectionner un statut" allowClear>
                                            <Select.Option value="1">Actif</Select.Option>
                                            <Select.Option value="0">Inactif</Select.Option>
                                        </Select>
                                    </Form.Item>
                                )}
                                <Form.Item>
                                    <Space>
                                        <Button onClick={handleReset}>
                                            Réinitialiser
                                        </Button>
                                        <Button type="primary" onClick={handleFilter}>
                                            Rechercher
                                        </Button>
                                        {showExpandButton && (
                                            <Button type="link" onClick={handleToggleExpand}>
                                                {expanded ? <UpOutlined /> : <DownOutlined />}
                                                {expanded ? ' Réduire' : ' Agrandir'}
                                            </Button>
                                        )}
                                    </Space>
                                </Form.Item>
                            </Form>
                        </Card>

                        {/*|--------------------------------------------------------------------------
                        | Categories Table
                        |-------------------------------------------------------------------------- */}
                        <ProTable
                            columns={columns}
                            actionRef={tableRef}
                            loading={loading}
                            dataSource={fsCategories}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                            }}
                            search={false}
                            onChange={({ current, pageSize }) => {
                                setPagination(prev => ({ ...prev, current, pageSize }));
                            }}
                            request={async (params) => {
                                const { current, pageSize } = params;

                                const response = await socialFundsCategoriesSlice.getFSCategories(current, pageSize, filters);
                                return {
                                    data: response.categories.reverse(),
                                    success: true,
                                    total: response.pagination.total,
                                };
                            }}
                            toolBarRender={() => [
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsAddDrawerOpen(true)}
                                >
                                    <FormattedMessage id={"ajouter une categorie"} />
                                </Button>,
                            ]}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>

            {/*|--------------------------------------------------------------------------
            | Add category
            |-------------------------------------------------------------------------- */}
            <Drawer
                title="Ajouter une catégorie"
                placement="right"
                onClose={handleCancel}
                open={isAddDrawerOpen}
                width={720}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            Annuler
                        </Button>
                        <Button loading={loading} type="primary" onClick={() => form.submit()}>
                            Ajouter
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleAddCategory}
                    initialValues={{
                        title: title,
                        active: active,
                        description: description,
                    }}
                >
                    <Form.Item
                        label="Entrer le titre de la catégorie"
                        name="title"
                        rules={[
                            { required: true, message: 'Le titre est obligatoire' }
                        ]}
                    >
                        <Input placeholder="Entrez votre titre ici..." value={title} onChange={handleTitle} />
                    </Form.Item>

                    <Form.Item
                        label="Active"
                        name="active"
                        valuePropName="checked"
                        rules={[
                            { required: true, message: 'Le titre est obligatoire' }
                        ]}
                    >
                        <Switch checked={active} onChange={handleActive} />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, message: 'La description est obligatoire' }
                        ]}
                    >
                        <ChEditor
                            readOnly={false}
                            value={description}
                            placeholder="Entrez votre description ici..."
                            onChange={handleDesc}
                        />
                    </Form.Item>
                </Form>
            </Drawer>

            {/*|--------------------------------------------------------------------------
            | Update category
            |-------------------------------------------------------------------------- */}
            <Drawer
                title="mettre a jour une catégorie"
                placement="right"
                onClose={handleCancel}
                open={isEditDrawerOpen}
                width={720}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            Annuler
                        </Button>
                        <Button loading={loading} type="primary" onClick={() => form.submit()}>
                            Mettre a jour
                        </Button>
                    </div>
                }
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleUpdateCategory}
                    initialValues={{
                        title: title,
                        active: active,
                        description: description,
                    }}
                >
                    <Form.Item
                        label="Entrer le titre de la catégorie"
                        name="title"
                        rules={[
                            { required: true, message: 'Le titre est obligatoire' }
                        ]}
                    >
                        <Input value={title} onChange={handleTitle} />
                    </Form.Item>

                    <Form.Item
                        label="Active"
                        name="active"
                        valuePropName="checked"
                        rules={[
                            { required: true, message: 'Le titre est obligatoire' }
                        ]}
                    >
                        <Switch checked={active} onChange={handleActive} />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            { required: true, message: 'La description est obligatoire' }
                        ]}
                    >
                        <ChEditor
                            readOnly={false}
                            value={description}
                            placeholder="Entrez votre description ici..."
                            onChange={handleDesc}
                        />
                    </Form.Item>
                </Form>
            </Drawer>

            {/*|--------------------------------------------------------------------------
            | Show category
            |-------------------------------------------------------------------------- */}
            <Drawer
                title="Afficher la catégorie"
                placement="right"
                onClose={handleCancel}
                open={isShowDrawerOpen}
                width={720}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            fermer
                        </Button>
                    </div>
                }
            >
                <div className="mb-3">
                    <label htmlFor="title">Entrer le titre de la catégorie</label>
                    <Input
                        id="title"
                        type="text"
                        value={currentCategory ? currentCategory.title : ""}
                        disabled
                    />
                </div>

                <div className="mb-3 d-flex gap-2">
                    <h6>Active</h6>
                    <Switch checked={active} disabled />
                </div>
                <div className="mb-3">
                    <ChEditor
                        readOnly={true}
                        value={currentCategory ? currentCategory.description : ""}
                        placeholder="Entrez votre description ici..."
                        onChange={handleDesc}
                    />
                </div>
            </Drawer>


            {/*|--------------------------------------------------------------------------
            | Show description
            |-------------------------------------------------------------------------- */}
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
        </div>
    );
}
export default SocialFundsCategories;