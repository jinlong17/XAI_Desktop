# Remaining direct typed preference bindings

Luna read-only inventory at fixed `ce38758`, independently reproduced by parent TypeScript AST scan. Scope: tracked `packages/**/*.tsx` excluding `__tests__`, direct identifier `usePref` calls. This is scheduling input, not a complete storage-writer inventory or coordinated activation evidence.

31 files /88 bindings;66 distinct literal keys plus2 dynamic binding sites;68 bindings expose a setter,65 have a direct in-file call and3 only downstream references;20 expose no setter. Counts are binding sites, not unique supported writers or ownership proof. Syntactic reference matching does not establish downstream behavior or symbol flow.

The first scanner failed to unwrap `as` assertions on key arguments and reported42 dynamic sites; its diagnostic JSON is preserved. The final parser unwraps those expressions and matches Luna's66 literal/2 dynamic result. [Fixed machine evidence](bindings-ce38758.json), [scanner](scan.mjs).

| Product source | Setter bindings | Read-only hook bindings |
|---|---|---|
| `packages/plugin-web-board-core/src/BoardModule.tsx` | `xai_boards_v2` L53, `xai_active_board` L54 |  |
| `packages/plugin-web-board-views/src/BoardModule.tsx` | `xai_boards_v2` L83, `xai_active_board` L84, `xai_board_view_by_id` L85 |  |
| `packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx` | `xai_boards_v2` L341, `xai_active_board` L342, `xai_board_workspaces` L343 (downstream), `xai_board_panels` L344, `xai_board_inbox` L345, `xai_board_view_by_id` L352, `xai_board_filter_by_id` L355 | `xai_task_cols` L346 |
| `packages/plugin-web-pomodoro/src/PomodoroModule.tsx` |  | `xai_pomodoro_sessions` L192 |
| `packages/plugin-web-settings-rest/src/CallbackPage.tsx` | `xai_pref_integrations_connected_notion` L57, `xai_pref_integrations_connected_gcal` L60, `xai_pref_integrations_connected_linear` L63 |  |
| `packages/plugin-web-settings-rest/src/panes/aiPane.tsx` | `xai_ai_provider` L49, `xai_ai_base_url` L53, `xai_ai_model_default` L57, `xai_ai_streaming` L61 |  |
| `packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx` | `xai_pref_collab_show_avatars` L26, `xai_pref_collab_mention_notify` L35 |  |
| `packages/plugin-web-settings-rest/src/panes/dateTimePane.tsx` | `xai_pref_dt_start_week` L21, `xai_pref_dt_lunar` L25, `xai_pref_dt_week_numbers` L29, `xai_pref_dt_holidays` L33, `xai_pref_dt_timezone` L37 |  |
| `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx` | `xai_pref_integrations_connected_notion` L94, `xai_pref_integrations_connected_gcal` L97, `xai_pref_integrations_connected_linear` L100 |  |
| `packages/plugin-web-settings-rest/src/panes/morePane.tsx` | `xai_pref_more_win_type` L129, `xai_pref_more_launch_at_login` L133, `xai_pref_more_minimize_on_launch` L137, `xai_pref_more_date_recognition` L141, `xai_pref_more_remove_date_text` L145, `xai_pref_more_remove_tags` L149, `xai_pref_more_url_parse` L153, `xai_pref_more_default_date` L157, `xai_pref_more_default_rem_due` L161, `xai_pref_more_default_rem_all` L165, `xai_pref_more_default_pri` L169, `xai_pref_more_default_tag` L173, `xai_pref_more_default_list` L177, `xai_pref_more_add_to` L181, `xai_pref_more_overdue_at` L185 |  |
| `packages/plugin-web-settings-rest/src/panes/notificationsPane.tsx` | `xai_pref_notif_enabled` L21, `xai_pref_notif_done_sound` L25, `xai_pref_notif_push_task` L29, `xai_pref_notif_push_pomo` L33, `xai_pref_notif_push_habit` L37, `xai_pref_notif_quiet` L41, `xai_pref_notif_quiet_start` L45, `xai_pref_notif_quiet_end` L49 |  |
| `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx` | `xai_pref_smart_lists` L81 |  |
| `packages/plugin-web-settings-rest/src/panes/stickyPane.tsx` | `xai_pref_sticky_color` L39, `xai_pref_sticky_font` L43, `xai_pref_sticky_pin_default` L47, `xai_pref_sticky_restore_size` L51, `xai_pref_sticky_grid_spacing` L55 |  |
| `packages/plugin-web-statistics/src/StatisticsModule.tsx` |  | `xai_pomodoro_sessions` L85, `xai_habits_state` L86, `xai_pref_week_start` L87, `xai_task_cols` L89 |
| `packages/xai-web-calendar/src/CalendarModule.tsx` | `xai_pref_week_start` L75, `xai_calendar_view` L80 | `xai_boards_v2` L77 |
| `packages/xai-web-dashboard-grid/src/DashboardModule.tsx` | `xai_dash_order` L50 (downstream) |  |
| `packages/xai-web-dashboard-widgets/src/StickyComposer.tsx` |  | `xai_task_cols` L246 |
| `packages/xai-web-dashboard-widgets/src/widgets/ClockWidget.tsx` | `xai_clock_style` L51, `xai_clock_tz` L52 |  |
| `packages/xai-web-dashboard-widgets/src/widgets/MailWidget.tsx` |  | `xai_task_cols` L37, `xai_calendar_events` L38 |
| `packages/xai-web-dashboard-widgets/src/widgets/MiniCalWidget.tsx` |  | `xai_calendar_events` L52 |
| `packages/xai-web-dashboard-widgets/src/widgets/StatPomos.tsx` |  | `xai_pomodoro_sessions` L35 |
| `packages/xai-web-dashboard-widgets/src/widgets/StatStreak.tsx` |  | `xai_habits_state` L35 |
| `packages/xai-web-dashboard-widgets/src/widgets/StatTasks.tsx` |  | `xai_task_cols` L31 |
| `packages/xai-web-dashboard-widgets/src/widgets/UpcomingWidget.tsx` |  | `xai_calendar_events` L42 |
| `packages/xai-web-dashboard-widgets/src/widgets/WorldClocks.tsx` | `xai_zones` L42 |  |
| `packages/xai-web-pet/src/DesktopPet.tsx` | `xai_pet_id` L82 (downstream), `xai_pet_pos` L83 |  |
| `packages/xai-web-settings-appearance/src/AppearancePane.tsx` |  | `xai_accent_hue` L52, `xai_rail_pos` L53, `xai_bg_tone` L55 |
| `packages/xai-web-settings-features-panel/src/FeaturesPane.tsx` | `prefKey` L69 |  |
| `packages/xai-web-settings-features-panel/src/withDisabledFallback.tsx` |  | `prefKey` L43 |
| `packages/xai-web-shell/src/AppRail.tsx` | `xai_rail_order` L37 |  |
| `packages/xai-web-tasks/src/TasksModule.tsx` |  | `xai_task_cols` L80 |

Luna identified three downstream paths: Dashboard order→useOrderSaveRecovery, Board workspace→useWorkspaceSaveRecovery, and pet selection→onSelect. These require source review before conversion. Read-only Appearance hook projections still coexist with separate setPref/removePref calls; FeaturesPane has a separate raw reset path; Tasks has list/tag autosave metadata alongside accepted canonical task commands. Thus a read-only binding is not proof that its whole file has no writers. Account/device classification and next-batch design belong to Astra's source review. No product modifications or gate closures are part of this inventory.

## Refreshed scheduling inventory at c9a388d

Parent reran the unchanged AST scanner against immutable `c9a388d`:29 files /85 bindings,63 distinct literal keys plus2 dynamic sites;65 setter bindings (62 directly invoked,3 downstream-only),20 read-only bindings. Machine evidence: [bindings-c9a388d.json](bindings-c9a388d.json).

Compared with ce38758, exactly three old direct bindings disappeared: Smart Lists `xai_pref_smart_lists`, Collaborate `xai_pref_collab_show_avatars` and `xai_pref_collab_mention_notify`. There are no newly added direct `usePref` bindings. This agrees with their accepted migrations; it does not erase other writers in those files or turn all remaining setters into proven defects. Header's async integration is outside this direct-old-hook scan and remains under final review.

The historical table above retains its original fixed revision. Use the new JSON for current scheduling after Header acceptance. The scan still excludes wrapper/indirect/raw/secrets/non-TSX writers; whole D2/REL-05 coverage requires its broader contract. No numbered audit item is closed by this inventory refresh.
