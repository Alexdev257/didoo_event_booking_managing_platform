import ConfirmForm from "../confirm/_components/confirmForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
    const { key } = await searchParams;
    return <ConfirmForm resetKey={key} />;
}
