from tethys_sdk.base import TethysAppBase
from tethys_sdk.app_settings import PersistentStoreDatabaseSetting

class HydroserverClient(TethysAppBase):
    """
    Tethys app class for Hydroserver Client.
    """

    name = 'Hydroserver Client'
    description = 'This is an application to display HydroServer 2 and GEOGLoWS data'
    package = 'hydroserver_client'  # WARNING: Do not change this value
    index = 'home'
    icon = f'{package}/images/icon.gif'
    root_url = 'hydroserver-client'
    color = '#8e44ad'
    tags = ''
    enable_feedback = False
    feedback_emails = []

    def persistent_store_settings(self):
        """
        Define Persistent Store Settings.
        """
        ps_settings = (
            PersistentStoreDatabaseSetting(
                name='primary_db',
                description='primary database',
                initializer='hydroserver_client.model.init_primary_db',
                required=True
            ),
        )

        return ps_settings

