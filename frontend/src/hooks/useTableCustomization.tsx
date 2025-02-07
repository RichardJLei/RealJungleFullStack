import { useState } from "react";
import { Form, Modal, Input, Checkbox, Space, Button, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";

interface ColumnDefinition {
  defaultTitle: string;
  key: string;
  dataIndex: string | string[];
  render?: (value: any, record: any) => React.ReactNode;
  [key: string]: any;
}

interface TableCustomization {
  title?: string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

// Add type for the accumulator in reduce
type CustomizationAccumulator = {
  [key: string]: TableCustomization;
};

// Add search type enum
type SearchType = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'regex';

interface SearchConfig {
  text: string;
  type: SearchType;
}

export const useTableCustomization = (baseColumns: ColumnDefinition[]) => {
  const [columnCustomizations, setColumnCustomizations] = useState<Record<string, TableCustomization>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Update searchText state to include search type
  const [searchText, setSearchText] = useState<Record<string, SearchConfig>>({});
  const [searchedColumns, setSearchedColumns] = useState<string[]>([]);

  const handleSearch = (key: string, value: string, type: SearchType) => {
    setSearchText(prev => ({ ...prev, [key]: { text: value, type } }));
    setSearchedColumns(prev => 
      value ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
    );
  };

  const handleReset = (key: string) => {
    setSearchText(prev => ({ ...prev, [key]: { text: '', type: 'contains' } }));
    setSearchedColumns(prev => prev.filter(k => k !== key));
  };

  // Add function to test value against search pattern
  const matchesSearchPattern = (value: string, pattern: string, type: SearchType): boolean => {
    // Handle null/undefined values
    if (!value) return false;
    if (!pattern) return true;

    const valueStr = String(value).toLowerCase().trim();
    const patternStr = String(pattern).toLowerCase().trim();

    switch (type) {
      case 'contains':
        return valueStr.includes(patternStr);
      case 'equals':
        return valueStr === patternStr;
      case 'startsWith':
        return valueStr.startsWith(patternStr);
      case 'endsWith':
        return valueStr.endsWith(patternStr);
      case 'regex':
        try {
          const regex = new RegExp(patternStr, 'i');
          return regex.test(valueStr);
        } catch (e) {
          return valueStr.includes(patternStr);
        }
      default:
        return valueStr.includes(patternStr);
    }
  };

  // Process columns with customizations
  const processedColumns = baseColumns.map(column => {
    const baseColumn = {
      ...column,
      title: columnCustomizations[column.key]?.title ?? column.defaultTitle,
      hidden: columnCustomizations[column.key]?.visible === false,
      sorter: columnCustomizations[column.key]?.sortable ? true : undefined,
    };

    // Add filter functionality if enabled
    if (columnCustomizations[column.key]?.filterable) {
      return {
        ...baseColumn,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
          const [searchValue, searchType] = selectedKeys;
          
          return (
            <div style={{ padding: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Select
                  value={searchType || 'contains'}
                  onChange={type => setSelectedKeys([searchValue || '', type])}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="contains">Contains</Select.Option>
                  <Select.Option value="equals">Equals</Select.Option>
                  <Select.Option value="startsWith">Starts With</Select.Option>
                  <Select.Option value="endsWith">Ends With</Select.Option>
                  <Select.Option value="regex">Regex</Select.Option>
                </Select>
                <Input
                  placeholder={`Search ${baseColumn.title}`}
                  value={searchValue}
                  onChange={e => setSelectedKeys([e.target.value, searchType || 'contains'])}
                  onPressEnter={() => {
                    confirm();
                    handleSearch(column.key, searchValue, searchType);
                  }}
                  style={{ width: '100%', marginBottom: 8 }}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      confirm();
                      handleSearch(column.key, searchValue, searchType);
                    }}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Search
                  </Button>
                  <Button
                    onClick={() => {
                      clearFilters?.();
                      handleReset(column.key);
                      confirm();
                    }}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Reset
                  </Button>
                </Space>
              </Space>
            </div>
          );
        },
        filterIcon: (filtered: boolean) => (
          <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value: string, record: any) => {
          const fieldValue = Array.isArray(column.dataIndex)
            ? column.dataIndex.reduce((obj, key) => obj?.[key], record)
            : record[column.dataIndex];

          // Get the search type from selectedKeys
          const searchConfig = searchText[column.key] || { text: value, type: 'contains' };
          
          return matchesSearchPattern(
            fieldValue,
            searchConfig.text,
            searchConfig.type
          );
        },
        filteredValue: searchedColumns.includes(column.key) 
          ? [searchText[column.key].text, searchText[column.key].type] 
          : null,
      } as ColumnType<any>;
    }

    return baseColumn;
  });

  const showCustomizeModal = () => {
    form.setFieldsValue(
      baseColumns.reduce((acc, column) => ({
        ...acc,
        [`${column.key}_title`]: columnCustomizations[column.key]?.title ?? column.defaultTitle,
        [`${column.key}_visible`]: columnCustomizations[column.key]?.visible ?? true,
        [`${column.key}_sortable`]: columnCustomizations[column.key]?.sortable ?? false,
        [`${column.key}_filterable`]: columnCustomizations[column.key]?.filterable ?? false,
      }), {})
    );
    setIsModalVisible(true);
  };

  const handleCustomizeOk = () => {
    form.validateFields().then((values) => {
      const newCustomizations = baseColumns.reduce((acc: CustomizationAccumulator, column) => {
        const customTitle = values[`${column.key}_title`];
        const visible = values[`${column.key}_visible`];
        const sortable = values[`${column.key}_sortable`];
        const filterable = values[`${column.key}_filterable`];
        const isDefault = customTitle === column.defaultTitle && 
                         visible === true && 
                         sortable === false &&
                         filterable === false;

        if (!isDefault) {
          acc[column.key] = {
            title: customTitle,
            visible,
            sortable,
            filterable,
          };
        }
        return acc;
      }, {});

      setColumnCustomizations(newCustomizations);
      setIsModalVisible(false);
    });
  };

  const renderCustomizeModal = () => (
    <Modal
      title="Customize Table"
      open={isModalVisible}
      onOk={handleCustomizeOk}
      onCancel={() => setIsModalVisible(false)}
      width={600}
    >
      <Form form={form} layout="vertical">
        {baseColumns.map((column) => (
          <div key={column.key} style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'flex-start',
            marginBottom: '16px' 
          }}>
            <Form.Item 
              name={`${column.key}_title`} 
              label={`${column.defaultTitle} Column`}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input />
            </Form.Item>
            <Space style={{ marginTop: '29px' }}>
              <Form.Item 
                name={`${column.key}_visible`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Show</Checkbox>
              </Form.Item>
              <Form.Item 
                name={`${column.key}_sortable`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Sort</Checkbox>
              </Form.Item>
              <Form.Item 
                name={`${column.key}_filterable`} 
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Checkbox>Filter</Checkbox>
              </Form.Item>
            </Space>
          </div>
        ))}
      </Form>
    </Modal>
  );

  return {
    processedColumns,
    showCustomizeModal,
    renderCustomizeModal,
  };
}; 