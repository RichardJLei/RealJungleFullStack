import React from "react";
import { useTable } from "@refinedev/antd";
import { Table, Button } from "antd";
import { List, DateField } from "@refinedev/antd";
import { useTableCustomization } from "../../hooks/useTableCustomization";

export const BlogPostSQLList = () => {
  const { tableProps } = useTable({
    resource: "blog-post-sql",
    syncWithLocation: true,
    pagination: {
      pageSize: 10,
    },
    filters: {
      mode: "server",
      defaultBehavior: "replace",
    },
    onSearch: (params) => {
      console.log('=== onSearch START ===');
      console.log('Raw params:', params);
      console.log('Raw filters:', params.filters);

      // Transform the filters
      const filters = params.filters?.map(filter => {
        console.log('Processing filter:', filter);
        
        // Handle the case where filter.value is an array containing our filter object
        if (Array.isArray(filter.value) && filter.value.length > 0) {
          const actualFilter = filter.value[0];
          console.log('Found array filter value:', actualFilter);
          return actualFilter;
        }
        
        // Handle the case where filter is already in the correct format
        if (filter.field && filter.operator && filter.value) {
          console.log('Found direct filter:', filter);
          return filter;
        }
        
        console.log('Unexpected filter format:', filter);
        return {
          field: filter.field,
          operator: 'contains',
          value: filter.value
        };
      });

      console.log('Final transformed filters:', filters);
      return { filters };
    },
    meta: {
      fields: ["id", "title", "content", "created_at"],
      sort: {
        field: "_sort",
        order: "_order",
      },
    },
    sorters: {
      mode: "server",
      initial: [],
    },
  });

  console.log('Table Props:', tableProps);

  const baseColumns = [
    {
      defaultTitle: "ID",
      dataIndex: "id",
      key: "id",
      fieldName: "id",
    },
    {
      defaultTitle: "Title",
      dataIndex: "title",
      key: "title",
      fieldName: "title",
    },
    {
      defaultTitle: "Content",
      dataIndex: "content",
      key: "content",
      fieldName: "content",
    },
    {
      defaultTitle: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      fieldName: "created_at",
      render: (value: string) => <DateField value={value} />,
    },
  ];

  const { processedColumns, showCustomizeModal, renderCustomizeModal } = 
    useTableCustomization(baseColumns);

  return (
    <List
      headerButtons={({ defaultButtons }) => [
        ...(defaultButtons || []),
        <Button
          key="customize"
          onClick={showCustomizeModal}
          type="primary"
        >
          Customize Table
        </Button>
      ]}
    >
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ["10", "20", "50", "100"],
          showQuickJumper: true,
        }}
      >
        {processedColumns
          .filter(column => !column.hidden)
          .map(({ hidden, defaultTitle, key, ...columnProps }) => (
            <Table.Column key={key} {...columnProps} />
          ))}
      </Table>
      {renderCustomizeModal()}
    </List>
  );
}; 