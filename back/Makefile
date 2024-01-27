shell:
	python manage.py shell

run:
	python manage.py runserver 0.0.0.0:5024

install:
	pip install -r requirements.txt

migrate:
	python manage.py makemigrations
	python manage.py migrate

pipe:
	make install
	make migrate
	make run
