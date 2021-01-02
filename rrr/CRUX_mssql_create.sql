
CREATE TABLE [state] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	state_name varchar(50),
	state_id varchar(5),
	billing varchar(5),
	concession varchar(5),
)

CREATE TABLE [discom] (
    id INT NOT NULL IDENTITY PRIMARY KEY,
	discom_name varchar(50),
	discom_id varchar(5),
    stateId int FOREIGN KEY REFERENCES state(id)
)

CREATE TABLE [region] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	region varchar(50),
	region_id varchar(5),
	discomId int FOREIGN KEY REFERENCES discom(id),
)

CREATE TABLE [circle] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	circle_name varchar(50),
	circle_id varchar(5),
	regionId int FOREIGN KEY REFERENCES region(id)
)

CREATE TABLE [division] (
	id INT NOT NULL IDENTITY PRIMARY KEY,
	division_name varchar(50),
	division_id varchar(5),
	circleId int FOREIGN KEY REFERENCES circle(id)
)


CREATE TABLE [subdivision] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	subname varchar(50),
	subid varchar(5),
	divisionId int FOREIGN KEY REFERENCES division(id),
)
CREATE TABLE [consumer] (
    id INT NOT NULL IDENTITY PRIMARY KEY,
	consumer_no varchar(15),
	acc_no varchar(15),
	binder_no varchar(15),
	token_no varchar(15),
	office_code varchar(15),
	consumer_name varchar(100),
	consumer_add1 nvarchar(max),
	consumer_add2 nvarchar(max),
	consumer_add3 nvarchar(max),
	consumer_add4 nvarchar(max),
	pincode varchar(10),
	meter_no_generator varchar(15),
	meter_mf_generator varchar(15),
	consumer_contact_no varchar(15),
	consumer_contact_person varchar(50),
	consumer_mail varchar(50),
	ss_code varchar(10),
	feeder_code varchar(10),
	dt_code varchar(10),
	make_code varchar(5),
	meter_no varchar(15),
	subdivisionId int FOREIGN KEY REFERENCES subdivision(id),
)

CREATE TABLE [meter] (
	id INT NOT NULL IDENTITY PRIMARY KEY,
	meter_no varchar(10),
	meter_cat varchar(10),
	meter_status integer,
	bill_mf float(10),
	make_code varchar(10),
	meter_location nvarchar(max),
	meter_mf integer,
	meter_ct_ratio integer,
	meter_pt_ratio integer,
	meter_con_status nvarchar(max),
	meter_com_type nvarchar(max),
	meter_com_port nvarchar(max),
	meter_tech_type nvarchar(max),
	c_rated integer,
	meter_install_date varchar(20),
	modem_install_status varchar(50),
	meter_no_feeder varchar(15),
	route_seq_no varchar(20),
	latitude varchar(20),
	longitude varchar(20),
	hierarchy_code varchar(30),
	v_rated float(10),
	sanction_load float(10),
	contract_demand float(10),
	supply_cat varchar(10),
	tariff_cat varchar(10),
	ext_pt_ratio float(10),
	ext_ct_ratio float(10),
	mtr_type varchar(20),
	mtr_pri_cur integer,
	mtr_sec_cur integer,
	subname varchar(20),
	divname varchar(20),
	circlename varchar(20),
	old_meter_no varchar(20),
	old_meter_make_code varchar(10),
	old_meter_mf float(10),
	industry_type nvarchar(max),
	consumer_name varchar(50),
	consumer_no varchar(15),
	consumerId int FOREIGN KEY REFERENCES consumer(id),
	subdivisionId int FOREIGN KEY REFERENCES subdivision(id),
)

CREATE TABLE [d1] (
	id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	D1 nvarchar(max)
)

CREATE TABLE [d2] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	D2 nvarchar(max),
)

CREATE TABLE [d3] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	bill_date_time datetime,
	Reset_type varchar(20),
	D3 nvarchar(max),
	meterId int FOREIGN KEY REFERENCES meter(id),
)

CREATE TABLE [d4] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	date_time varchar(20),
	meter_ip integer,
	vr float(10),
	vy float(10),
	vb float(10),
	v_av float(10),
	ir float(10),
	iy float(10),
	ib float(10),
	i_av float(10),
	kwh float(10),
	kvah float(10),
	kwh_ex float(10),
	kvah_ex float(10),
	meterId int FOREIGN KEY REFERENCES meter(id),
 
)
CREATE TABLE [d5] (
	id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date datetime,
	eventcode integer,
	occured varchar(30),
	restored varchar(30),
	duration varchar(20),
	consumption_value varchar(10),
	event_name varchar(50),
	vr_occ float(20),
	vy_occ float(20),
	vb_occ float(20),
	ir_occ float(20),
	iy_occ float(20),
	ib_occ float(20),
	pf_r_occ float(20),
	pf_y_occ float(20),
	pf_b_occ float(20),
	kwh_occ float(20),
	kvah_occ float(20),
	vr_res float(20),
	vy_res float(20),
	vb_res float(20),
	ir_res float(20),
	iy_res float(20),
	ib_res float(20),
	pf_r_res float(20),
	pf_y_res float(20),
	pf_b_res float(20),
	kwh_res float(20),
	kvah_res float(20),
	meterId int FOREIGN KEY REFERENCES meter(id),
)

CREATE TABLE [d9] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	event_date varchar(20),
	event_code integer,
	event_name varchar(50),
	meterId int FOREIGN KEY REFERENCES meter(id),
)


CREATE TABLE [daily] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	date_obj datetime,
	hierarchy_code varchar(30),
	date varchar(20),
	kwh float(10),
	kvah float(10),
	max_kw float(10),
	max_kva float(10),
	min_kw float(10),
	min_kva float(10),
	pf float(10),
	nl_slot float(10),
	nl float(10),
	bo_slot float(10),
	bo float(10),
	cd_slot float(10),
	cd_cnt float(10),
	demand_l20_cd float(10),
	demand_g20_40_cd float(10),
	demand_g40_80_cd float(10),
	demand_g80_100_cd float(10),
	pf_l5 float(10),
	pf_5_7 float(10),
	pf_7_9 float(10),
	pf_g9 float(10),
	tot_slots float(10),
	used_slots float(10),
	meterId int FOREIGN KEY REFERENCES meter(id),
 
)

CREATE TABLE [dataprocess] (
id INT NOT NULL IDENTITY PRIMARY KEY,

	hierarchy_code varchar(30),
	month_year varchar(10),
	launchedAt varchar(20),
	div_name varchar(20),
	subdiv_name varchar(20),
	process_date varchar(20),
	meter_rtc varchar(20),
	meter_ip integer,
	file_dest_path nvarchar(max),
	xml_status varchar(20),
	report_status varchar(10),
	bill_from_date varchar(20),
	bill_to_date varchar(20),
	D2 varchar(10),
	D3 varchar(10),
	D4 varchar(10),
	D5 varchar(10),
	D9 varchar(10),
	wiring varchar(10),
	consumption varchar(10),
	daily varchar(10),
	event varchar(10),
	monthly_D2 varchar(10),
	monthly_D3 varchar(10),
	monthly_D4 varchar(10),
	monthly_D5 varchar(10),
	meterId int FOREIGN KEY REFERENCES meter(id),
)
CREATE TABLE [fileprocess] (
 id INT NOT NULL IDENTITY PRIMARY KEY,
	launchedAt datetime NOT NULL,
	month_year varchar(10),
	status  varchar(10),
	total_count integer,
	success_count integer,
	exception_count integer,
	error_count integer,
	duplicate_count integer,
	parser  varchar(10),
	subtable  varchar(10),
	monthly  varchar(10),	 
)
CREATE TABLE [masterprocess] (
 id INT NOT NULL IDENTITY PRIMARY KEY,
	upload_date datetime NOT NULL,
	process_status varchar(20),
	path nvarchar(max),
	count varchar(10),
	division_name varchar(20),
	subdivision_id integer NOT NULL,
	subdivision_name varchar(50),
	make_code varchar(10),
	make_name varchar(30),
	error_count varchar(10),
 
)
CREATE TABLE [wiring] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	hierarchy_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	status nvarchar(max),
	meterId int FOREIGN KEY REFERENCES meter(id),
  
)

CREATE TABLE [event] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	error_code varchar(30),
	month_year varchar(10),
	date_obj datetime,
	event nvarchar(max),
	meterId int FOREIGN KEY REFERENCES meter(id),
)


CREATE TABLE [errorlog] (
id INT NOT NULL IDENTITY PRIMARY KEY,
	error_occured_date datetime NOT NULL,
	launchedAt nvarchar(max),
	error_code varchar(30),
	error_type nvarchar(max),
	file_path  nvarchar(max),
	error_desc  nvarchar(max),
	error_remark  nvarchar(max),
)
