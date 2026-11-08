export function parseRepositories(data) {
    if (!data || !data.trim()) {
        return [];
    }

    const entries = data.match(/\[([^\]]*)\]/g);

    if (!entries) {
        return [];
    }

    return entries.map((entry) => {
        const content = entry.slice(1, -1);
        const repository = {
            zips: []
        };

        const versionMatch = content.match(/version=([^,]*)/);

        if (versionMatch) {
            repository.version = versionMatch[1];
        }

        const zipsMatch = content.match(/zips=\{(.*)\}/);

        if (zipsMatch) {
            const zipContent = zipsMatch[1];

            const zipObjects = zipContent.split(/,(?=name=)/);

            repository.zips = zipObjects.map((zip) => {
                const nameMatch = zip.match(/name=([^,]*)/);
                const pathMatch = zip.match(/path=([^,]*)/);

                return {
                    name: nameMatch ? nameMatch[1] : "",
                    path: pathMatch ? pathMatch[1] : ""
                };
            });
        }

        return repository;
    });
}