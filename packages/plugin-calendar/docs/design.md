# plugin-calendar Design

Calendar data is currently a mock aggregation model with source labels for todo, pomodoro, habit, project, and manual events. The UI is split into a reusable mini month grid and a day timeline.

The package exports only public components and a widget manifest. It does not import productivity or project plugin internals.
