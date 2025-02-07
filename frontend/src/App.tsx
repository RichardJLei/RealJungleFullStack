import { GitHubBanner, Refine, DataProvider } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import simpleRestDataProvider from "@refinedev/simple-rest";
import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { BlogPostSQLList } from "./pages/blog-post-sql/list";

const API_URL = "http://localhost:8000";

// Create base data provider instance
const baseDataProvider = simpleRestDataProvider(API_URL);

// Extend with custom functionality
const customDataProvider: DataProvider = {
  ...baseDataProvider,
  getList: async ({ resource, pagination, sorters }) => {
    const { current = 1, pageSize = 10 } = pagination ?? {};
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('_page', String(current));
    queryParams.append('_limit', String(pageSize));

    // Add sort parameters in the correct format
    if (sorters && sorters.length > 0) {
      queryParams.append('_sort', sorters[0].field);
      queryParams.append('_order', sorters[0].order);
    }

    // Make the API call with the correct URL format
    const url = `${API_URL}/${resource}/?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const total = response.headers.get('x-total-count') 
      ? parseInt(response.headers.get('x-total-count') || '0', 10)
      : 0;

    return {
      data,
      total,
    };
  },
};

// Create data providers object with named providers
const dataProviders = {
  default: simpleRestDataProvider("https://api.fake-rest.refine.dev"),
  sql: customDataProvider,
};

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProviders}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                resources={[
                  {
                    name: "blog_posts",
                    list: "/blog-posts",
                    create: "/blog-posts/create",
                    edit: "/blog-posts/edit/:id",
                    show: "/blog-posts/show/:id",
                    meta: {
                      canDelete: true,
                      dataProviderName: "default",
                    },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: {
                      canDelete: true,
                      dataProviderName: "default",
                    },
                  },
                  {
                    name: "blog-post-sql",
                    list: "/blog-post-sql",
                    meta: {
                      canDelete: false,
                      dataProviderName: "sql",
                      label: "Blog Post SQL",
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "HoFcqa-ADDR4h-CmlfIz",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ThemedLayoutV2
                        Header={() => <Header sticky />}
                        Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="blog_posts" />}
                    />
                    <Route path="/blog-posts">
                      <Route index element={<BlogPostList />} />
                      <Route path="create" element={<BlogPostCreate />} />
                      <Route path="edit/:id" element={<BlogPostEdit />} />
                      <Route path="show/:id" element={<BlogPostShow />} />
                    </Route>
                    <Route path="/categories">
                      <Route index element={<CategoryList />} />
                      <Route path="create" element={<CategoryCreate />} />
                      <Route path="edit/:id" element={<CategoryEdit />} />
                      <Route path="show/:id" element={<CategoryShow />} />
                    </Route>
                    <Route path="/blog-post-sql">
                      <Route index element={<BlogPostSQLList />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
