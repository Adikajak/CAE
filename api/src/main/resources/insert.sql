INSERT INTO specialities(name)
VALUES ('Archer'), ('Assassin'), ('Mage'), ('Guerrier'), ('Clerc'), ('Paladin'), ('Rodeur')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users(email, password, tag, profile_picture, speciality_id)
VALUES (
	'admin@vinci.be',
	'$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu',
	'admin',
	'https://robohash.org/admin?set=set2',
	(SELECT id FROM specialities WHERE name = 'Guerrier')
)
ON CONFLICT (email) DO NOTHING;
