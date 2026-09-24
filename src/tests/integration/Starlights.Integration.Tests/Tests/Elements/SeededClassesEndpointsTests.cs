using AwesomeAssertions;
using Starlights.Integration.Drivers.Elements.Endpoints;
using Starlights.Integration.Extensions;

namespace Starlights.Integration.Tests.Elements;

/// <summary>
/// Reads the classes, class features, and subclasses the seeder creates. The other suites only read
/// elements they created through the API, so they never caught seeded elements missing a component.
/// </summary>
[TestClass]
public sealed class SeededClassesEndpointsTests : IntegrationTestBase
{
    private IntegrationHost _integration = default!;
    private ManageClassesEndpointDriver _classesApi = default!;
    private ManageClassFeaturesEndpointDriver _classFeaturesApi = default!;
    private ManageSubClassesEndpointDriver _subClassesApi = default!;

    [TestInitialize]
    public async Task Initialize()
    {
        _integration = IntegrationHost.CreateDefaultBuilder(this)
            .Build();

        _classesApi = _integration.GetDriver<ManageClassesEndpointDriver>();
        _classFeaturesApi = _integration.GetDriver<ManageClassFeaturesEndpointDriver>();
        _subClassesApi = _integration.GetDriver<ManageSubClassesEndpointDriver>();

        await _integration.InitializeElements();
    }

    [TestCleanup]
    public void Cleanup()
    {
        _integration.Dispose();
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetClasses_AfterSeed_ReturnsSeededClassesWithHitPointDie()
    {
        // Act
        var payload = await _classesApi.GetListAsync();

        // Assert
        payload.Items.Should().HaveCount(2, "the seed creates the Barbarian and the Rogue");
        payload.Items.Should().ContainSingle(x => x.Name == "Barbarian")
            .Which.HitPointDie.Should().Be("d12", "the seeded Barbarian uses a d12 hit point die");
        payload.Items.Should().ContainSingle(x => x.Name == "Rogue")
            .Which.HitPointDie.Should().Be("d8", "the seeded Rogue uses a d8 hit point die");
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetClassById_AfterSeed_ReturnsEachSeededClass()
    {
        // Arrange
        var classes = await _classesApi.GetListAsync();

        foreach (var item in classes.Items)
        {
            // Act
            var payload = await _classesApi.GetAsync(item.Id);

            // Assert
            payload.Should().NotBeNull($"the seeded class '{item.Name}' should be readable by its id");
            payload!.Name.Should().Be(item.Name, "the details should match the listed class");
        }
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetClassFeatures_AfterSeed_ReturnsFeaturesLinkedToTheirClass()
    {
        // Arrange
        var classes = await _classesApi.GetListAsync();
        var barbarian = classes.Items.Single(x => x.Name == "Barbarian");
        var rogue = classes.Items.Single(x => x.Name == "Rogue");

        // Act
        var payload = await _classFeaturesApi.GetListAsync();

        // Assert
        payload.Items.Should().HaveCount(8, "the seed creates five Barbarian features and three Rogue features");
        payload.Items.Where(x => x.ParentId == barbarian.Id).Should().HaveCount(5, "five features belong to the Barbarian");
        payload.Items.Where(x => x.ParentId == rogue.Id).Should().HaveCount(3, "three features belong to the Rogue");
        payload.Items.Should().AllSatisfy(feature =>
        {
            feature.Level.Should().BeInRange(1, 20, "every seeded feature is granted at a class level");
            feature.ParentName.Should().NotBeNullOrWhiteSpace("every seeded feature names its parent class");
        });
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetClassFeatureById_AfterSeed_ReturnsEachSeededFeature()
    {
        // Arrange
        var features = await _classFeaturesApi.GetListAsync();

        foreach (var item in features.Items)
        {
            // Act
            var payload = await _classFeaturesApi.GetAsync(item.Id);

            // Assert
            payload.Should().NotBeNull($"the seeded feature '{item.Name}' should be readable by its id");
            payload!.Level.Should().Be(item.Level, "the details should match the listed feature");
        }
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetSubClasses_AfterSeed_ReturnsSubClassesLinkedToTheBarbarian()
    {
        // Arrange
        var classes = await _classesApi.GetListAsync();
        var barbarian = classes.Items.Single(x => x.Name == "Barbarian");

        // Act
        var payload = await _subClassesApi.GetListAsync();

        // Assert
        payload.Items.Should().HaveCount(3, "the seed creates three Barbarian subclasses");
        payload.Items.Should().AllSatisfy(subclass =>
        {
            subclass.ParentId.Should().Be(barbarian.Id, "every seeded subclass belongs to the Barbarian");
            subclass.ParentName.Should().Be("Barbarian", "the parent name is stored with the link");
        });
    }

    [TestMethod]
    [Timeout(TestConstants.Timeout, CooperativeCancellation = true)]
    public async Task GetSubClassById_AfterSeed_ReturnsEachSeededSubClass()
    {
        // Arrange
        var subclasses = await _subClassesApi.GetListAsync();

        foreach (var item in subclasses.Items)
        {
            // Act
            var payload = await _subClassesApi.GetAsync(item.Id);

            // Assert
            payload.Should().NotBeNull($"the seeded subclass '{item.Name}' should be readable by its id");
            payload!.ParentId.Should().Be(item.ParentId, "the details should match the listed subclass");
        }
    }
}
