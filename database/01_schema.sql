
create table Stable
(stableId varchar(15) not null,
stableName varchar(30),
location varchar(30),
colors varchar(20),
primary key (stableId));

create table Horse
(horseId varchar(15) not null,
horseName varchar(15) not null,
age int,
gender char,
registration integer not null,
stableId varchar(30) not null,
foreign key(stableId) references Stable(stableId),
primary key(horseId));

create table Owner
(ownerId varchar(15) not null,
lname varchar(15),
fname varchar(15),
primary key(ownerId));

create table Owns
(ownerId varchar(15) not null,
horseId varchar(15) not null,
primary key(ownerId, horseId),
foreign key(ownerId) references Owner(ownerId),
foreign key(horseId) references Horse(horseId));

create table Trainer
(trainerId varchar(15) not null,
lname varchar(30),
fname varchar(30),
stableId varchar(30),
primary key(trainerId),
foreign key(stableId) references Stable(stableId));

create table Track
(trackName varchar(30) not null,
location varchar(30),
length integer,
primary key(trackName));
create table Race
(raceId varchar(15) not null,
raceName varchar(30),
trackName varchar(30),
raceDate date,
raceTime time,
primary key(raceId),
foreign key (trackName) references Track(trackName));

create table RaceResults
(raceId varchar(15) not null,
horseId varchar(15) not null,
results varchar(15),
prize float(10,2),
primary key (raceId, horseId),
foreign key(raceId) references Race(raceId),
foreign key(horseId) references Horse(horseId));