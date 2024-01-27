pipe:
	pip install -r back/requirements.txt
	python back/manage.py makemigrations
	python back/manage.py migrate
	python back/manage.py runserver 0.0.0.0:5024
