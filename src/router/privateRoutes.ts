import type { RouteRecordRaw } from 'vue-router';

import ItemList from '@/views/item/ItemList.vue';
import ItemDetails from '@/views/item/ItemDetails.vue';

function createEntityRoutes(
    entity: string,
    entityName: string,
    basePath: string,
    queryPath: string,
    fields: string[],
    details: string[],
): RouteRecordRaw {
    return {
        path: `/backoffice/console/${basePath}`,
        redirect: `/backoffice/console/${basePath}/all`,
        name: `${basePath}-base`,
        meta: {
            entity,
            entityName,
            be_query: queryPath,
            fields,
            details,
            requiresAuth: true,
        },
        children: [
            {
                path: 'all',
                name: `${basePath}-all`,
                component: ItemList,
                props: (route) => ({
                    ...route.meta,
                    mode: 'read-all',
                    page: Number(route.query.page) || 1,
                    limit: Number(route.query.limit) || 10,
                    field: route.query.field || 'updated_at',
                    direction: route.query.direction || 'asc',
                }),
            },
            {
                path: 'details/:id',
                name: `${basePath}-details`,
                component: ItemDetails,
                props: (route) => ({
                    ...route.meta,
                    id: route.params.id,
                    mode: 'read',
                }),
            },
            {
                path: 'edit/:id',
                name: `${basePath}-edit`,
                component: ItemDetails,
                props: (route) => ({
                    ...route.meta,
                    id: route.params.id,
                    mode: 'edit',
                }),
            },
            {
                path: 'new',
                name: `${basePath}-new`,
                component: ItemDetails,
                props: (route) => ({
                    ...route.meta,
                    mode: 'new',
                }),
            },
        ],
    };
}

const privateRoutes: Array<RouteRecordRaw> = [
    // ********* USER PROFILE READ *********
    {
        path: '/backoffice/console/user/profile',
        name: 'profile-details',
        component: () => import('@/views/ProfileDetails.vue'),
        props: { mode: 'read' },
        meta: { requiresAuth: true },
    },
    // ********* USER PROFILE EDIT *********
    {
        path: '/backoffice/console/user/profile/edit',
        name: 'profile-edit',
        component: () => import('@/views/ProfileDetails.vue'),
        props: { mode: 'edit' },
        meta: { requiresAuth: true },
    },
    // ********* SETTINGS *********
    {
        path: '/backoffice/console/settings',
        name: 'fe-settings',
        component: () => import('@/views/FeSettings.vue'),
        meta: { requiresAuth: true },
    },
    // ********* PRODUCT Draft *********
    {
        path: '/backoffice/console/product/draft',
        name: 'product-draft',
        component: ItemList,
        meta: {
            entity: 'Bozze Prodotti',
            entityName: 'Bozze Prodotti',
            be_query: 'product',
            fields: ['Id', 'Nome', 'Utente Creatore', 'Data aggiornamento'],
            details: ['id', 'label_ita', 'creator', 'formatted_updated_at'],
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            mode: 'read-all',
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'asc',
        }),
    },
    // ********* PRODUCT Uncategorized *********
    {
        path: '/backoffice/console/product/uncategorized',
        name: 'product-uncat',
        component: ItemList,
        meta: {
            entity: 'Prodotti non categorizzati',
            entityName: 'Prodotti non categorizzati',
            be_query: 'product',
            fields: ['Id', 'Nome', 'Utente Creatore', 'Data aggiornamento'],
            details: ['id', 'label_ita', 'created', 'formatted_updated_at'],
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            mode: 'read-all',
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'asc',
        }),
    },
    // ********* PRODUCT Trash *********
    {
        path: '/backoffice/console/product/trash',
        name: 'product-trash',
        component: ItemList,
        meta: {
            entity: 'Cestino Prodotti',
            entityName: 'Cestino Prodotti',
            be_query: 'product/deleting',
            fields: ['Id', 'Nome', 'Data aggiornamento'],
            details: ['id', 'label_ita', 'formatted_updated_at'],
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            mode: 'read-all',
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'asc',
        }),
    },
    // ********* PRODUCT CATEGORY *********
    {
        path: '/backoffice/console/product/:id?/:label?/category',
        name: 'productCategory',
        component: ItemDetails,
        meta: {
            entity: 'Prodotti Categorie',
            entityName: 'Prodotto Categorie',
            be_query: 'catProduct',
            mode: 'new',
            basePath: 'category-product',
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            id: route.params.id || null,
            label: route.params.label || null,
            mode: route.query.mode || route.meta.mode,
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'asc',
        }),
    },
    // ********* CATEGORY PRODUCT *********
    {
        path: '/backoffice/console/category/:id?/:label?/product',
        name: 'categoryProduct',
        component: ItemDetails,
        meta: {
            entity: 'Categorie Prodotti',
            entityName: 'Categoria Prodotti',
            be_query: 'catProduct',
            mode: 'new',
            basePath: 'category-product',
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            id: route.params.id || null,
            label: route.params.label || null,
            mode: route.query.mode || route.meta.mode,
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'asc',
        }),
    },
    // ********* SEARCH *********
    {
        path: '/backoffice/console/search',
        name: 'search',
        component: ItemList,
        meta: {
            fields: ['Id', 'Nome', 'Data aggiornamento'],
            details: ['id', 'label_ita', 'formatted_updated_at'],
            requiresAuth: true,
        },
        props: (route) => ({
            ...route.meta,
            entity: route.params.type,
            text_query: route.query.text,
            type: route.query.type,
            mode: 'search',
            page: Number(route.query.page) || 1,
            limit: Number(route.query.limit) || 10,
            field: route.query.field || 'updated_at',
            direction: route.query.direction || 'desc',
        }),
    },
    // ********* ENTITY ROUTES *********
    createEntityRoutes(
        'Utenti',
        'Utente',
        'user',
        'user',
        ['Nome', 'Email', 'Data creazione'],
        ['name', 'email', 'formatted_created_at'],
    ),
    createEntityRoutes(
        'Prodotti',
        'Prodotto',
        'product',
        'product',
        ['Id', 'Nome', 'Utente Creatore', 'Data aggiornamento'],
        ['id', 'label_ita', 'creator', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Macro Categorie',
        'Macro Categoria',
        'macro-category',
        'category',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Categorie',
        'Categoria',
        'category',
        'category',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Sotto Categorie',
        'Sotto Categoria',
        'sub-category',
        'category',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Contatti',
        'Contatto',
        'contact',
        'contact',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Condizioni',
        'Condizione Prodotto',
        'condition',
        'condition',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Fiere',
        'Fiera',
        'show',
        'show',
        ['Id', 'Nome', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
    createEntityRoutes(
        'Faqs',
        'Faq',
        'faq',
        'faq',
        ['Id', 'Domanda', 'Data aggiornamento'],
        ['id', 'label_ita', 'formatted_updated_at'],
    ),
];

export default privateRoutes;
