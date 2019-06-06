db.users.insertMany([
	{
		"name": "Cory Hayes",
		"email": "hayescor@oregonstate.edu",
		"role": "admin",
		"password": "$2a$08$Y2IHnr/PU9tzG5HKrHGJH.zH3HAvlR5i5puD5GZ1sHA/mVrHKci72"
	},
	{
		"name": "Cody Luth",
		"email": "luthco@oregonstate.edu",
		"role": "instructor",
		"password": "$2a$08$bAKRXPs6fUPhqjZy55TIeO1e.aXud4LD81awrYncaCKJoMsg/s0c."
	},
	{
		"name": "Christopher Jansen",
		"email": "jansench@oregonstate.edu",
		"role": "student",
		"password": "$2a$08$WvRkJm.bz3zoRnmA.aQZBewLopoe00nA4qbzbnLyS4eRbm2MFNkMO"
	}
])
