from tethys_sdk.base import TethysAppBase


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