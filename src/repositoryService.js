const API_URL = "http://localhost:8081/api/repos/repo";

export async function getRepositories(repositoryName) {
    const params = new URLSearchParams({
        name: repositoryName
    });

    const response = await fetch(`${API_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.text();

    return data;
}