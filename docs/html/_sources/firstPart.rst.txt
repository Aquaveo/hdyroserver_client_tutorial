========
Tutorial
========

The following tutorial will walk help you to create a `Tethys <https://docs.tethysplatform.org/en/stable/>`_  application that retrieves stations from a `HydroServer <https://hydroserver2.github.io/hydroserver/guide/getting-started.html>`_ instance 
and, it saves reaches from the `GEOGloWS ECMWF Streamflow Service <https://geoglows.ecmwf.int/documentation>`_ into a local PostgreSQL application.


Requirements
------------

- tethys-platform installed locally in the development environment.
- Any Text Editor

Getting Started
---------------

Please create an scaffold of the app using the following command:

.. code-block:: bash


    conda activate tethys
    tethys scaffold hydroserver_client
    tethys install -d


The following will create a start up project, that we will need to clean, please copy the following contents to the following files:
The `home.html` should be the following:

.. code-block:: html


    {% extends "hydroserver_client/base.html" %}

    {% block header_buttons %}
    <div class="header-button glyphicon-button" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Help">
        <a data-bs-toggle="modal" data-bs-target="#help-modal"><i class="bi bi-question-circle"></i></a>
    </div>
    {% endblock %}

    {% block app_content %}

    {% endblock %}

    {# Use the after_app_content block for modals #}
    {% block after_app_content %}
    <!-- Example Modal -->
    <div class="modal fade" id="help-modal" tabindex="-1" role="dialog" aria-labelledby="help-modal-label">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="help-modal-label">Example Modal</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
            <p>You can add custom buttons to the app header using the <code>header_buttons</code> block. Use anchor/link tags for the button and wrap it in a div with the class <code>header-button</code>. For buttons with the gliphyicons, add the <code>glyphicon-button</code> class as well.</p>
            <p>Ever have trouble using a modal in a Tethys app? Use the <code>after_app_content</code> block for modal content to allow them to function properly. See: <a href="https://getbootstrap.com/docs/5.1/components/modal/">Bootstrap Modals</a></p>
            <p>Add tooltips to any element by adding the <code>data-bs-toggle</code>, <code>data-bs-placement</code>, and <code>title</code> attributes to the button. See: <a href="https://getbootstrap.com/docs/5.1/components/tooltips/">Bootstrap Tooltips</a></p>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
            </div>
        </div>
        </div>
    </div>
    {% endblock %}

    {% block app_actions %}

    {% endblock %}

The `base.html` should be the following:

.. code-block:: html


    {% extends "tethys_apps/app_base.html" %}

    {% load static %}

    {% block title %}{{ tethys_app.name }}{% endblock %}

    {% block app_icon %}
    {# The path you provided in your app.py is accessible through the tethys_app.icon context variable #}
    <img src="{% if 'http' in tethys_app.icon %}{{ tethys_app.icon }}{% else %}{% static tethys_app.icon %}{% endif %}" />
    {% endblock %}

    {# The name you provided in your app.py is accessible through the tethys_app.name context variable #}
    {% block app_title %}{{ tethys_app.name }}{% endblock %}

    {% block app_navigation_items %}

    {% endblock %}

    {% block app_content %}
    {% endblock %}

    {% block app_actions %}
    {% endblock %}

    {% block content_dependent_styles %}
    {{ block.super }}
    <link href="{% static 'hydroserver_client/css/main.css' %}" rel="stylesheet"/>
    {% endblock %}

    {% block scripts %}
    {{ block.super }}
    <script src="{% static 'hydroserver_client/js/main.js' %}" type="text/javascript"></script>
    {% endblock %}

The `controllers.py` should be the following:

.. code-block:: python


    from django.shortcuts import render
    from tethys_sdk.routing import controller

    @controller
    def home(request):
        """
        Controller for the app home page.
        """
        context = {

        }

        return render(request, 'hydroserver_client/home.html', context)

Adding HydroServer Things
-------------------------

1. First we need to add a map

2. Call the HydroServer API


Adding TimeSeries for HydroServer
---------------------------------

1. Making markers interactive
2. Calling the API

Saving GEOGLoWS reach_id
------------------------

1. Making the map interactive
2. Creating a database and saving data
   

Adding Forecast TimeSeries to the GeoGlows Reach id
---------------------------------------------------
1. Making map interactive
   
2. Calling the service