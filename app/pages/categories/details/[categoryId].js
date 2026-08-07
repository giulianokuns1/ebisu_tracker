import React from "react";
import Head from 'next/head';
import { WEBSITE_NAME } from '@/constants';
import { useTranslation } from '@/Hooks/useTranslation';
import { withAuth } from "@/Hoc/withAuth";
import styles from "@/Components/Categories/Categories.module.scss";
import LayoutApp from '@/Components/Layout/LayoutApp';
import AppPageHeader from '@/Components/Layout/AppPageHeader';
import CategoriesForm from "@/Components/Categories/CategoriesForm";
import { useRouter } from "next/router";

function CategoriesDetailsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { categoryId } = router.query;

    return (
        <LayoutApp>
            <Head>
                <title>{`Category | ${WEBSITE_NAME}`}</title>
            </Head>
            <AppPageHeader eyebrow="Category details" title={t('Edit Category')} description="Update how this category appears in your transactions." />
            <div className={styles.categoryForm}>
                <CategoriesForm categoryId={categoryId} />
            </div>
        </LayoutApp>
    );
}

export default withAuth(CategoriesDetailsPage);
