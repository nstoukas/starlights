using System.Net;
using System.Net.Http.Json;
using AwesomeAssertions;
using Starlights.Integration.Drivers.Elements.Endpoints;
using Starlights.Integration.Extensions;

namespace Starlights.Integration.Tests.Elements;

[TestClass]
public sealed class ElementsEndpointTests : IntegrationTestBase
{
    private IntegrationHost _integration = default!;

    [TestInitialize]
    public void Initialize()
    {
        _integration = IntegrationHost.CreateDefaultBuilder(this)
            .Build();
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task InitializeElements_WhenCalledWithGet_ReturnsMethodNotAllowed()
    {
        // Arrange
        var client = _integration.CreateClient();

        // Act
        var response = await client.GetAsync("/api/elements/initialize", _integration.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.MethodNotAllowed, "seeding writes data, so a crawler or link prefetch must not trigger it");
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task InitializeElements_WhenDatabaseEmpty_ReturnsSuccess()
    {
        // Arrange
        var client = _integration.CreateClient();

        // Act
        var response = await client.PostAsync("/api/elements/initialize", null, _integration.CancellationToken);

        // Assert
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadFromJsonAsync<object>(_integration.CancellationToken);
        json.Should().NotBeNull("expected response content to be deserializable");
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task InitializeElements_WhenCalledTwice_AddsNothingTheSecondTime()
    {
        // Arrange
        var elementsApi = _integration.GetDriver<ManageElementsEndpointDriver>();

        await _integration.InitializeElements();
        var seeded = await elementsApi.GetListAsync();

        // Act
        await _integration.InitializeElements();

        // Assert
        var afterSecondRun = await elementsApi.GetListAsync();
        seeded.Items.Should().NotBeEmpty("the first run should seed the empty database");
        afterSecondRun.Items.Should().HaveCount(seeded.Items.Count, "the second run should find the seed in place and add nothing");
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task InitializeElements_WhenDatabaseEmpty_ReportsThatItSeeded()
    {
        // Arrange
        var client = _integration.CreateClient();

        // Act
        var response = await client.PostAsync("/api/elements/initialize", null, _integration.CancellationToken);

        // Assert
        var payload = await response.Content.ReadFromJsonAsync<InitializationResponse>(_integration.CancellationToken);
        payload.Should().NotBeNull("expected the initialize response to be deserializable");
        payload!.Message.Should().Be("Elements module initialized successfully.", "an empty database gets seeded");
        payload.ElementsCount.Should().BePositive("the seed writes rows to the empty database");
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task InitializeElements_WhenAlreadySeeded_ReportsThatNothingWasAdded()
    {
        // Arrange
        var client = _integration.CreateClient();
        await _integration.InitializeElements();

        // Act
        var response = await client.PostAsync("/api/elements/initialize", null, _integration.CancellationToken);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK, "running the seed again is harmless, not an error");
        var payload = await response.Content.ReadFromJsonAsync<InitializationResponse>(_integration.CancellationToken);
        payload.Should().NotBeNull("expected the initialize response to be deserializable");
        payload!.Message.Should().Be("Elements module was already initialized, nothing was added.", "the caller should learn the seed was skipped");
        payload.ElementsCount.Should().Be(0, "nothing is written when elements already exist");
    }

    /// <summary>
    /// The body the initialize endpoint returns.
    /// </summary>
    private sealed record InitializationResponse(string Message, int ElementsCount);
}
