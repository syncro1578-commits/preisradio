"""
Wagtail hooks: inject AI generate button into BlogPage editor.
Creates a draft page server-side and redirects to its edit page.
"""
from django.urls import path
from django.utils.html import format_html

from wagtail import hooks

from blog.views_admin import ai_generate_ajax


@hooks.register('register_admin_urls')
def register_ai_urls():
    return [
        path('ai-generate/', ai_generate_ajax, name='ai-generate'),
    ]


@hooks.register('insert_editor_js')
def editor_js():
    return format_html("""
<script>
(function() {{
    function init() {{
        const excerptField = document.getElementById('id_excerpt');
        if (!excerptField) return;
        if (document.getElementById('ai-generate-btn')) return;

        const titleField = document.getElementById('id_title');
        if (!titleField) return;

        // Container
        const container = document.createElement('div');
        container.style.cssText = 'margin:12px 0 16px;display:flex;align-items:center;gap:12px;';

        // Topic input
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'ai-topic-input';
        input.placeholder = 'Thema eingeben (z.B. Beste Kopfhörer unter 100€)';
        input.style.cssText = 'flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;';

        // Category select
        const catSelect = document.createElement('select');
        catSelect.id = 'ai-category-select';
        catSelect.style.cssText = 'padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;background:#fff;';
        ['Kaufberatung','Spartipps','Technik','News'].forEach(function(c) {{
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            catSelect.appendChild(opt);
        }});

        // Button
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'ai-generate-btn';
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>AI generieren';
        btn.style.cssText = 'padding:8px 18px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;display:flex;align-items:center;';

        container.appendChild(input);
        container.appendChild(catSelect);
        container.appendChild(btn);

        const titlePanel = titleField.closest('[data-field]') || titleField.closest('.w-panel') || titleField.parentElement.parentElement;
        titlePanel.parentElement.insertBefore(container, titlePanel.nextSibling);

        // Status
        const status = document.createElement('div');
        status.id = 'ai-status';
        status.style.cssText = 'display:none;padding:10px 14px;border-radius:6px;margin-bottom:12px;font-size:13px;';
        container.parentElement.insertBefore(status, container.nextSibling);

        // Spin CSS
        if (!document.getElementById('ai-spin-style')) {{
            const style = document.createElement('style');
            style.id = 'ai-spin-style';
            style.textContent = '@keyframes aispin {{ to {{ transform: rotate(360deg); }} }}';
            document.head.appendChild(style);
        }}

        btn.addEventListener('click', async function() {{
            const topic = input.value.trim();
            if (!topic) {{
                input.focus();
                input.style.borderColor = '#ef4444';
                return;
            }}
            input.style.borderColor = '#d1d5db';
            const category = catSelect.value;

            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #93c5fd;border-top-color:#fff;border-radius:50%;animation:aispin 0.6s linear infinite;margin-right:6px;"></span>Generiert...';
            status.style.display = 'block';
            status.style.background = '#e0f2fe';
            status.style.color = '#1e40af';
            status.style.border = '1px solid #7dd3fc';
            status.textContent = 'Groq generiert den Artikel... Bitte warten.';

            try {{
                const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                    || document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

                const resp = await fetch('/wagtail-admin/ai-generate/', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    }},
                    body: JSON.stringify({{ topic: topic, category: category }}),
                }});

                const data = await resp.json();

                if (!resp.ok) {{
                    throw new Error(data.error || 'Fehler bei der Generierung');
                }}

                // Server created a draft page — redirect to its edit page
                status.style.background = '#d1fae5';
                status.style.color = '#065f46';
                status.style.border = '1px solid #6ee7b7';
                status.innerHTML = 'Artikel "<b>' + data.title + '</b>" als Entwurf erstellt! Weiterleitung...';

                setTimeout(function() {{
                    window.location.href = data.edit_url;
                }}, 1000);

            }} catch (err) {{
                status.style.background = '#fee2e2';
                status.style.color = '#991b1b';
                status.style.border = '1px solid #fca5a5';
                status.textContent = 'Fehler: ' + err.message;
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>AI generieren';
            }}
        }});
    }}

    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', function() {{ setTimeout(init, 500); }});
    }} else {{
        setTimeout(init, 500);
    }}
}})();
</script>
""")
