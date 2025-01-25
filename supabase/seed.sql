SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '224f35e3-8898-48ac-825f-8799ea307726', 'authenticated', 'authenticated', 'test_user_02@todo.ex', '$2a$10$7hu.pNHrrupwlwh/GY/rbuihJNc3H5qu970paJlPfQTpuxyZRX4iu', '2025-01-10 10:29:52.388438+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-20 02:28:36.680807+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-01-10 10:29:52.36297+00', '2025-01-20 02:28:36.682305+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '624c6ed1-3d25-4dd8-932f-8bab9837b79d', 'authenticated', 'authenticated', 'test_user_01@todo.ex', '$2a$10$uikHuBQJOomdbBCSkfRvgO305UQgvswoMi78k995Md2Jf.2tDDada', '2025-01-10 10:29:24.057743+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-24 23:26:02.678298+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-01-10 10:29:24.04523+00', '2025-01-24 23:26:02.680887+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4', 'authenticated', 'authenticated', 'sungwoo.cho.dev@gmail.com', '$2a$10$1fFZ/2scK4JzxpHXYYBN0OM6xSZKtrmpfeuEsw89k8U88KY6Q6bO2', '2025-01-05 06:53:00.223477+00', NULL, '', '2025-01-05 06:52:45.285797+00', '', NULL, '', '', NULL, '2025-01-12 00:48:11.479996+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4", "email": "sungwoo.cho.dev@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-05 06:52:45.28105+00', '2025-01-20 00:09:54.441412+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4', '51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4', '{"sub": "51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4", "email": "sungwoo.cho.dev@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2025-01-05 06:52:45.283352+00', '2025-01-05 06:52:45.283397+00', '2025-01-05 06:52:45.283397+00', '0ac1b5b9-69af-4387-95e5-5b950bed07ea'),
	('624c6ed1-3d25-4dd8-932f-8bab9837b79d', '624c6ed1-3d25-4dd8-932f-8bab9837b79d', '{"sub": "624c6ed1-3d25-4dd8-932f-8bab9837b79d", "email": "test_user_01@todo.ex", "email_verified": false, "phone_verified": false}', 'email', '2025-01-10 10:29:24.054356+00', '2025-01-10 10:29:24.054415+00', '2025-01-10 10:29:24.054415+00', 'a04dce6a-c405-45aa-9eab-2267a1765908'),
	('224f35e3-8898-48ac-825f-8799ea307726', '224f35e3-8898-48ac-825f-8799ea307726', '{"sub": "224f35e3-8898-48ac-825f-8799ea307726", "email": "test_user_02@todo.ex", "email_verified": false, "phone_verified": false}', 'email', '2025-01-10 10:29:52.383077+00', '2025-01-10 10:29:52.383148+00', '2025-01-10 10:29:52.383148+00', '9dc24dec-7427-4335-b3c8-ad20d2c4ef62');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."todos" ("id", "user_id", "task", "is_complete", "inserted_at", "team_id") VALUES
	(3, '51e3d3a7-f134-4c10-8a39-bc9c3e7d50b4', '111111', false, '2025-01-10 08:48:30.074983+00', NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 307, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."teams_id_seq"', 99, true);


--
-- Name: todos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."todos_id_seq"', 68, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
