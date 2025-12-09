/**
 * Utility function to fix corrupted UTF-8 encoding in Spanish text
 * Detects and corrects common encoding issues like:
 * - "Ã¡" → "á"
 * - "Ã©" → "é"
 * - "Ã­" → "í"
 * - "Ã³" → "ó"
 * - "Ãº" → "ú"
 * - "Ã±" → "ñ"
 * - "Ã" → "Á"
 * etc.
 */
export function fixSpanishEncoding(text: string): string {
    if (!text) return text;

    // Map of corrupted encoding to correct characters
    // Using explicit string replacements to avoid encoding issues in source code
    let fixed = text;

    // Lowercase vowels with accents
    fixed = fixed.replace(/Ã¡/g, 'á');
    fixed = fixed.replace(/Ã©/g, 'é');
    fixed = fixed.replace(/Ã­/g, 'í');
    fixed = fixed.replace(/Ã³/g, 'ó');
    fixed = fixed.replace(/Ãº/g, 'ú');
    fixed = fixed.replace(/Ã±/g, 'ñ');

    // Uppercase vowels with accents
    fixed = fixed.replace(/Ã/g, 'Á');
    fixed = fixed.replace(/Ã‰/g, 'É');
    fixed = fixed.replace(/Ã/g, 'Í');
    fixed = fixed.replace(/Ã"/g, 'Ó');
    fixed = fixed.replace(/Ãš/g, 'Ú');
    // Using unicode escape for Ñ to avoid source encoding issues
    fixed = fixed.replace(/Ã\u0091/g, '\u00D1');

    // Additional common patterns
    fixed = fixed.replace(/Ã¼/g, 'ü');
    fixed = fixed.replace(/Ãœ/g, 'Ü');
    fixed = fixed.replace(/Ã§/g, 'ç');
    fixed = fixed.replace(/Ã‡/g, 'Ç');

    return fixed;
}

/**
 * Fix encoding issues in localStorage data
 * This runs automatically on app load to correct any corrupted data
 */
export function fixLocalStorageEncoding(): void {
    try {
        // Fix subjects
        const subjectsStr = localStorage.getItem('pensum_subjects');
        if (subjectsStr) {
            const subjects = JSON.parse(subjectsStr);
            let hasChanges = false;

            const fixedSubjects = subjects.map((subject: any) => {
                const fixedName = fixSpanishEncoding(subject.nombre);
                const fixedEje = fixSpanishEncoding(subject.eje);

                if (fixedName !== subject.nombre || fixedEje !== subject.eje) {
                    hasChanges = true;
                }

                // Fix other text fields if they exist
                const fixed = {
                    ...subject,
                    nombre: fixedName,
                    eje: fixedEje
                };

                // Fix details if present
                if (subject.details) {
                    if (subject.details.objetivos) {
                        fixed.details.objetivos = fixSpanishEncoding(subject.details.objetivos);
                    }
                    if (subject.details.competencias) {
                        fixed.details.competencias = fixSpanishEncoding(subject.details.competencias);
                    }
                }

                return fixed;
            });

            if (hasChanges) {
                localStorage.setItem('pensum_subjects', JSON.stringify(fixedSubjects));
                console.log('✅ Fixed encoding in subjects');
            }
        }

        // Fix ejes
        const ejesStr = localStorage.getItem('pensum_ejes');
        if (ejesStr) {
            const ejes = JSON.parse(ejesStr);
            let hasChanges = false;

            const fixedEjes = ejes.map((eje: any) => {
                const fixedName = fixSpanishEncoding(eje.nombre);
                const fixedLabel = fixSpanishEncoding(eje.label);

                if (fixedName !== eje.nombre || fixedLabel !== eje.label) {
                    hasChanges = true;
                }

                return {
                    ...eje,
                    nombre: fixedName,
                    label: fixedLabel
                };
            });

            if (hasChanges) {
                localStorage.setItem('pensum_ejes', JSON.stringify(fixedEjes));
                console.log('✅ Fixed encoding in ejes');
            }
        }

        // Fix program info
        const infoStr = localStorage.getItem('pensum_info');
        if (infoStr) {
            const info = JSON.parse(infoStr);
            let hasChanges = false;

            const fixedName = fixSpanishEncoding(info.name || '');
            const fixedUniversity = fixSpanishEncoding(info.university || '');

            if (fixedName !== info.name || fixedUniversity !== info.university) {
                hasChanges = true;
                localStorage.setItem('pensum_info', JSON.stringify({
                    ...info,
                    name: fixedName,
                    university: fixedUniversity
                }));
                console.log('✅ Fixed encoding in program info');
            }
        }

    } catch (error) {
        console.error('Error fixing encoding:', error);
    }
}
