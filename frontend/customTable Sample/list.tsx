import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  MarkdownField,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table, Button } from "antd";
import { useTableCustomization } from "../../hooks/useTableCustomization";

export const BlogPostList: React.FC = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { data: categoryData, isLoading: categoryIsLoading } = useMany({
    resource: "categories",
    ids: tableProps?.dataSource?.map((item) => item?.category?.id) ?? [],
    queryOptions: {
      enabled: !!tableProps?.dataSource,
    },
  });

  const baseColumns = [
    {
      defaultTitle: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      defaultTitle: "Content",
      dataIndex: "content",
      key: "content",
      render: (value: string) => (
        <MarkdownField value={value.slice(0, 80) + "..."} />
      ),
    },
    {
      defaultTitle: "Category",
      dataIndex: ["category", "id"],
      key: "category.id",
      render: (value: number) =>
        categoryIsLoading ? (
          <>Loading...</>
        ) : (
          categoryData?.data?.find((item) => item.id === value)?.title
        ),
    },
    {
      defaultTitle: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => <DateField value={value} />,
    },
    {
      defaultTitle: "Actions",
      dataIndex: "actions",
      key: "actions",
      render: (_: string, record: BaseRecord) => (
        <Space>
          <EditButton hideText size="small" recordItemId={record.id} />
          <ShowButton hideText size="small" recordItemId={record.id} />
          <DeleteButton hideText size="small" recordItemId={record.id} />
        </Space>
      ),
    },
  ];

  const { processedColumns, showCustomizeModal, renderCustomizeModal } = useTableCustomization(baseColumns);

  return (
    <List
      headerButtons={[
        <Button key="customize" onClick={showCustomizeModal}>
          Customize Table
        </Button>
      ]}
    >
      <Table {...tableProps} rowKey="id">
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
