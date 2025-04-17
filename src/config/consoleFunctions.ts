// src/data/consoleFunctions.ts

export default interface ConsoleFunction {
    sectionTitle: string;
    icon: string;
    label?: string;
    routes: ConsoleFunction[] | null;
    to?: string;
    active: boolean;
}

export const consoleFunctionsExt = [
    {
        sectionTitle: 'Impostazioni Sito web',
        icon: 'settings',
        routes: null,
        to: '/backoffice/console/settings',
        active: true,
    },
    {
        sectionTitle: 'Gestione Categorie',
        icon: 'categories',
        active: true,
        routes: [
            {
                sectionTitle: 'Macro-Categorie',
                icon: 'category',
                active: true,
                routes: [
                    {
                        label: 'Inserisci macro-categoria',
                        to: '/backoffice/console/macro-category/new',
                        icon: 'plus',
                        active: true,
                    },
                    {
                        label: 'Lista macro-categorie',
                        to: '/backoffice/console/macro-category/all',
                        icon: 'list',
                        active: true,
                    },
                ],
            },
            {
                sectionTitle: 'Categorie',
                icon: 'category',
                active: true,
                routes: [
                    {
                        label: 'Inserisci categoria',
                        to: '/backoffice/console/category/new',
                        icon: 'plus',
                        active: true,
                    },
                    {
                        label: 'Lista categorie',
                        to: '/backoffice/console/category/all',
                        icon: 'list',
                        active: true,
                    },
                ],
            },
            {
                sectionTitle: 'Sub-Categorie',
                icon: 'category',
                active: true,
                routes: [
                    {
                        label: 'Inserisci sub-categoria',
                        to: '/backoffice/console/sub-category/new',
                        icon: 'plus',
                        active: true,
                    },
                    {
                        label: 'Lista sub-categorie',
                        to: '/backoffice/console/sub-category/all',
                        icon: 'list',
                        active: true,
                    },
                ],
            },
            {
                sectionTitle: 'Associa prodotti',
                icon: 'options',
                routes: null,
                to: '/backoffice/console/category/product',
                active: true,
            },
        ],
    },
    // ********* Prodotti *********
    {
        sectionTitle: 'Gestione Prodotti',
        icon: 'product',
        active: true,
        routes: [
            {
                sectionTitle: 'Cestino',
                icon: 'trash',
                routes: null,
                to: '/backoffice/console/product/trash',
                active: true,
            },
            {
                sectionTitle: 'Prodotti',
                icon: 'product',
                active: true,
                routes: [
                    {
                        label: 'Inserisci prodotto',
                        to: '/backoffice/console/product/new',
                        icon: 'product_add',
                        active: true,
                    },
                    {
                        label: 'Lista prodotti',
                        to: '/backoffice/console/product/all',
                        icon: 'product_list',
                        active: true,
                    },
                    {
                        label: 'Lista bozze',
                        to: '/backoffice/console/product/draft',
                        icon: 'draft',
                        active: true,
                    },
                    {
                        label: 'Senza categoria',
                        to: '/backoffice/console/product/uncategorized',
                        icon: 'uncat',
                        active: true,
                    },
                ],
            },
            {
                sectionTitle: 'Condizioni prodotti',
                icon: 'condition',
                active: true,
                routes: [
                    {
                        label: 'Inserisci condizione prodotto',
                        to: '/backoffice/console/condition/new',
                        icon: 'plus',
                        active: true,
                    },
                    {
                        label: 'Lista condizioni prodotti',
                        to: '/backoffice/console/condition/all',
                        icon: 'list',
                        active: true,
                    },
                ],
            },
            {
                sectionTitle: 'Associa categorie',
                icon: 'options',
                routes: null,
                to: '/backoffice/console/product/category',
                active: true,
            },
        ],
    },
    // ********* CONTACTS *********
    {
        sectionTitle: 'Contatti',
        icon: 'contact',
        active: true,
        routes: [
            {
                label: 'Inserisci contatto',
                to: '/backoffice/console/contact/new',
                icon: 'link_add',
                active: true,
            },
            {
                label: 'Lista contatti',
                to: '/backoffice/console/contact/all',
                icon: 'list',
                active: true,
            },
        ],
    },
    // ********* FAQ *********
    {
        sectionTitle: 'FAQ',
        icon: 'faq',
        active: true,
        routes: [
            {
                label: 'Inserisci FAQ',
                to: '/backoffice/console/faq/new',
                icon: 'plus',
                active: true,
            },
            {
                label: 'Lista FAQ',
                to: '/backoffice/console/faq/all',
                icon: 'list',
                active: true,
            },
        ],
    },
    // ********* Shows *********
    {
        sectionTitle: 'Fiere',
        icon: 'show',
        active: true,
        routes: [
            {
                label: 'Inserisci fiera',
                to: '/backoffice/console/show/new',
                icon: 'show_add',
                active: true,
            },
            {
                label: 'Lista fiere',
                to: '/backoffice/console/show/all',
                icon: 'list',
                active: true,
            },
        ],
    },
];
