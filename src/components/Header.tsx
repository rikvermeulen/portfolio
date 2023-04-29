import Container from '@/components/Container';

export default function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <Container className="flex place-items-start justify-between">
        <div className="flex items-center gap-4"></div>
      </Container>
    </header>
  );
}
