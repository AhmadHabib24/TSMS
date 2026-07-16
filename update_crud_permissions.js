const fs = require('fs');
const path = require('path');

const modules = [
    { file: 'customers/page.tsx', name: 'customers' },
    { file: 'services/page.tsx', name: 'services' },
    { file: 'inventory/page.tsx', name: 'inventory' },
];

modules.forEach(m => {
    const fullPath = path.join(__dirname, 'src/app/(dashboard)', m.file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Add import
        if (!content.includes('usePermissions')) {
            content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { usePermissions } from '@/hooks/usePermissions';");
        }

        // Add hook
        if (!content.includes('const { can } = usePermissions();')) {
            content = content.replace(/const \[isModalOpen.*?;\n/, "$&\n  const { can } = usePermissions();\n");
        }

        // Replace Add Button
        content = content.replace(
            /<button onClick=\{.*? openModal\(\)\} className="bg-\[var\(--color-gold\)\].*?>.*?Add New<\/button>/,
            `{can('${m.name}', 'add') && (
          $&
        )}`
        );

        // Replace Edit/Delete Buttons
        content = content.replace(
            /<td className="py-4">\s*<button onClick=\{.*? openModal\(item\)\}.*?<Edit.*?\s*<button onClick=\{.*? handleDelete\(item\.id\)\}.*?<Trash2.*?<\/button>\s*<\/td>/s,
            `<td className="py-4 flex gap-3">
                  {can('${m.name}', 'edit') && (
                    <button onClick={() => openModal(item)} className="mr-3 text-gray-400 hover:text-white transition-colors"><Edit size={18}/></button>
                  )}
                  {can('${m.name}', 'delete') && (
                    <button onClick={() => handleDelete(item.id)} className="text-red-500/70 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  )}
                </td>`
        );

        // Improve error handling
        content = content.replace(/catch \(err\) \{/, "catch (err: any) {");
        content = content.replace(/toast\.error\('Operation failed\.'\);/, "toast.error(err.response?.data?.error || 'Operation failed.');");
        content = content.replace(/toast\.error\('Failed to delete'\);/, "toast.error(err.response?.data?.error || 'Failed to delete');");

        fs.writeFileSync(fullPath, content);
        console.log(`Updated permissions in ${m.file}`);
    }
});
