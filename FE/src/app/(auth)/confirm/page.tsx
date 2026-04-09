import ConfirmForm from "./_components/confirmForm";

interface ConfirmPageProps {
    searchParams: Promise<{
        key?: string;
    }>;
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
    const { key } = await searchParams;

    return <ConfirmForm resetKey={key} />;
}