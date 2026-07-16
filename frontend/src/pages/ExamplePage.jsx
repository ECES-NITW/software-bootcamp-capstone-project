import useExamples from "../hooks/useExamples";

const ExamplePage = () => {

    const { data: examples, isLoading, isError } = useExamples();

    return (
        <div>
            {isLoading && <p>Loading…</p>}

            {isError && <p>Failed to load.</p>}

            {examples?.map((example) => (
                <div key={example.id}>{example.title}</div>
            ))}
        </div>
    );
};

export default ExamplePage;
