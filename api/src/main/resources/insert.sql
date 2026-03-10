INSERT INTO specialities(name)
VALUES ('Archer'), ('Assassin'), ('Mage'), ('Guerrier'), ('Clerc'), ('Paladin'), ('Rodeur')
ON CONFLICT (name) DO NOTHING;

INSERT INTO profile_pictures(url)
-- Place all profile picture URLs here (20+ URLs supported).
VALUES ('https://robohash.org/admin?set=set2'),
       ('https://robohash.org/archer?set=set2'),
       ('https://robohash.org/mage?set=set2')
ON CONFLICT (url) DO NOTHING;

INSERT INTO users(email, password, tag, profile_picture_id, speciality_id)
VALUES (
	'admin@vinci.be',
	'$2y$10$EW75BdcbCfKEA3NbE7in4OiYYacfP3OY4Q2JsVzjxd3jNxxgAEZNu',
	'admin',
	(SELECT id FROM profile_pictures WHERE url = 'https://robohash.org/admin?set=set2'),
	(SELECT id FROM specialities WHERE name = 'Guerrier')
)
ON CONFLICT (email) DO NOTHING;
