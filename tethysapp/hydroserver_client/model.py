import json
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, Float, String
from sqlalchemy.orm import sessionmaker


Base = declarative_base()


# SQLAlchemy ORM definition for the dams table
class Geoglows_reach(Base):
    """
    SQLAlchemy GEOGLOWS_REACH DB Model
    """
    __tablename__ = 'geoglows_reach'

    # Columns
    id = Column(Integer, primary_key=True)
    latitude = Column(Float)
    longitude = Column(Float)
    reach_id = Column(Integer)
    region = Column(String)
    distance = Column(Float)

def init_primary_db(engine, first_time):
    """
    Initializer for the primary database.
    """
    Base.metadata.create_all(engine)

    if first_time:
        Session = sessionmaker(bind=engine)
        session = Session()
        session.commit()
        session.close()