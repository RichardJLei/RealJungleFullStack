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

// Update the search type to match backend operators
type SearchType = 
  // Comparison operators
  | 'eq' 
  | 'ne' 
  | 'lt' 
  | 'lte' 
  | 'gt' 
  | 'gte'
  // Text search operators
  | 'contains'
  | 'ncontains'
  | 'startswith'
  | 'endswith'
  | 'nstartswith'
  | 'nendswith';

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

  // Update the matchesSearchPattern function to handle all operators
  const matchesSearchPattern = (value: any, pattern: string, type: SearchType): boolean => {
    // Handle null/undefined values
    if (!value) return false;
    if (!pattern) return true;

    const valueStr = String(value).toLowerCase().trim();
    const patternStr = String(pattern).toLowerCase().trim();

    // Try to convert to number for comparison operators
    const numValue = Number(value);
    const numPattern = Number(pattern);
    const isNumeric = !isNaN(numValue) && !isNaN(numPattern);

    switch (type) {
      // Comparison operators
      case 'eq':
        return isNumeric ? numValue === numPattern : valueStr === patternStr;
      case 'ne':
        return isNumeric ? numValue !== numPattern : valueStr !== patternStr;
      case 'lt':
        return isNumeric && numValue < numPattern;
      case 'lte':
        return isNumeric && numValue <= numPattern;
      case 'gt':
        return isNumeric && numValue > numPattern;
      case 'gte':
        return isNumeric && numValue >= numPattern;
      
      // Text search operators
      case 'contains':
        return valueStr.includes(patternStr);
      case 'ncontains':
        return !valueStr.includes(patternStr);
      case 'startswith':
        return valueStr.startsWith(patternStr);
      case 'nstartswith':
        return !valueStr.startsWith(patternStr);
      case 'endswith':
        return valueStr.endsWith(patternStr);
      case 'nendswith':
        return !valueStr.endsWith(patternStr);
      default:
        return false;
    }
  };

  // Update the filter dropdown to show appropriate operators based on column type
  const getOperatorOptions = (column: ColumnDefinition) => {
    // Determine if the column is numeric
    const isNumeric = column.dataIndex === 'id' || 
      typeof column.render === 'function' && column.render.toString().includes('number');

    if (isNumeric) {
      return [
        { label: 'Equals', value: 'eq' },
        { label: 'Not Equals', value: 'ne' },
        { label: 'Less Than', value: 'lt' },
        { label: 'Less Than or Equal', value: 'lte' },
        { label: 'Greater Than', value: 'gt' },
        { label: 'Greater Than or Equal', value: 'gte' },
      ];
    }

    return [
      { label: 'Contains', value: 'contains' },
      { label: 'Does Not Contain', value: 'ncontains' },
      { label: 'Starts With', value: 'startswith' },
      { label: 'Does Not Start With', value: 'nstartswith' },
      { label: 'Ends With', value: 'endswith' },
      { label: 'Does Not End With', value: 'nendswith' },
    ];
  };

  // Process columns with customizations
  const processedColumns = baseColumns.map(column => {
    const baseColumn = {
      ...column,
      title: columnCustomizations[column.key]?.title ?? column.defaultTitle,
      hidden: columnCustomizations[column.key]?.visible === false,
      sorter: columnCustomizations[column.key]?.sortable 
        ? (a: any, b: any) => {
            const aValue = Array.isArray(column.dataIndex)
              ? column.dataIndex.reduce((obj, key) => obj?.[key], a)
              : a[column.dataIndex];
            const bValue = Array.isArray(column.dataIndex)
              ? column.dataIndex.reduce((obj, key) => obj?.[key], b)
              : b[column.dataIndex];
            return String(aValue).localeCompare(String(bValue));
          }
        : undefined,
    };

    // Add filter functionality if enabled
    if (columnCustomizations[column.key]?.filterable) {
      return {
        ...baseColumn,
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
          <div style={{ padding: 8 }}>
            <Space direction="vertical">
              <Select
                style={{ width: 200 }}
                placeholder="Select Operator"
                value={searchText[column.key]?.type || 'contains'}
                onChange={(value: SearchType) => 
                  handleSearch(column.key, searchText[column.key]?.text || '', value)
                }
                options={getOperatorOptions(column)}
              />
              <Input
                placeholder={`Search ${column.defaultTitle}`}
                value={searchText[column.key]?.text}
                onChange={e => 
                  handleSearch(column.key, e.target.value, searchText[column.key]?.type || 'contains')
                }
                style={{ width: 188, marginBottom: 8, display: 'block' }}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={() => confirm()}
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
                  }}
                  size="small"
                  style={{ width: 90 }}
                >
                  Reset
                </Button>
              </Space>
            </Space>
          </div>
        ),
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